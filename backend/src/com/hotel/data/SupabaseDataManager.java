package com.hotel.data;

import com.hotel.model.*;
import com.hotel.supabase.SupabaseClient;
import com.hotel.supabase.SupabaseClient.SupabaseResponse;
import com.hotel.util.AppLogger;
import com.hotel.util.JsonUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Data synchronization engine connecting the Hotel domain model to Supabase PostgreSQL.
 * Provides bidirectional sync, seed initialization, and fallback protection.
 */
public class SupabaseDataManager {
    private final SupabaseClient client;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    public SupabaseDataManager(SupabaseClient client) {
        this.client = client;
    }

    public boolean isConnected() {
        return client.isConfigured();
    }

    // ==========================================
    // ROOMS
    // ==========================================

    public List<Room> loadRooms() {
        if (!client.isConfigured()) return Collections.emptyList();

        try {
            SupabaseResponse resp = client.get("rooms", "select=*&order=room_number.asc");
            if (!resp.success || resp.body.trim().isEmpty() || "[]".equals(resp.body.trim())) {
                AppLogger.warn("[Supabase] No rooms found in Supabase database.");
                return Collections.emptyList();
            }

            List<Map<String, String>> rows = JsonUtils.parseJsonArray(resp.body);
            List<Room> rooms = new ArrayList<>();

            for (Map<String, String> row : rows) {
                String number = row.get("room_number");
                String type = row.get("room_type");
                double price = parseDouble(row.get("base_price_per_night"), 110.0);
                int capacity = parseInt(row.get("capacity"), 2);
                boolean available = Boolean.parseBoolean(row.get("is_available"));
                String desc = row.get("description");

                if ("Suite".equalsIgnoreCase(type)) {
                    rooms.add(new SuiteRoom(number, price, capacity, available, desc));
                } else {
                    rooms.add(new StandardRoom(number, price, capacity, available, desc));
                }
            }

            AppLogger.info("[Supabase] Successfully loaded " + rooms.size() + " rooms from Supabase DB.");
            return rooms;
        } catch (Exception e) {
            AppLogger.error("[Supabase] Error loading rooms: " + e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    public void seedRooms(List<Room> rooms) {
        if (!client.isConfigured() || rooms.isEmpty()) return;
        AppLogger.info("[Supabase] Seeding " + rooms.size() + " initial rooms into Supabase rooms table...");

        for (Room r : rooms) {
            double luxury = (r instanceof SuiteRoom) ? ((SuiteRoom) r).getLuxuryServiceFee() : 0.0;
            String json = String.format(Locale.US,
                    "{\"room_number\":\"%s\",\"room_type\":\"%s\",\"base_price_per_night\":%.2f,\"capacity\":%d,\"is_available\":%b,\"description\":\"%s\",\"tax_rate\":%.2f,\"luxury_service_fee\":%.2f}",
                    JsonUtils.escape(r.getRoomNumber()),
                    JsonUtils.escape(r.getRoomType()),
                    r.getBasePricePerNight(),
                    r.getCapacity(),
                    r.isAvailable(),
                    JsonUtils.escape(r.getDescription()),
                    r.getTaxRate(),
                    luxury);

            client.insert("rooms", json);
        }
    }

    public void updateRoomAvailability(String roomNumber, boolean available) {
        if (!client.isConfigured()) return;
        String json = "{\"is_available\":" + available + "}";
        client.update("rooms", "room_number=eq." + roomNumber, json);
    }

    // ==========================================
    // CUSTOMERS
    // ==========================================

    public Map<String, Customer> loadCustomers() {
        if (!client.isConfigured()) return Collections.emptyMap();
        Map<String, Customer> map = new LinkedHashMap<>();

        try {
            SupabaseResponse resp = client.get("customers", "select=*");
            if (!resp.success || resp.body.trim().isEmpty() || "[]".equals(resp.body.trim())) {
                return map;
            }

            List<Map<String, String>> rows = JsonUtils.parseJsonArray(resp.body);
            for (Map<String, String> row : rows) {
                String id = row.get("id");
                String name = row.get("name");
                String email = row.get("email");
                String phone = row.get("phone");
                if (id != null) {
                    map.put(id, new Customer(id, name, email, phone));
                }
            }
            AppLogger.info("[Supabase] Successfully loaded " + map.size() + " customers from Supabase DB.");
        } catch (Exception e) {
            AppLogger.error("[Supabase] Error loading customers: " + e.getMessage(), e);
        }
        return map;
    }

    public void saveCustomer(Customer c) {
        if (!client.isConfigured() || c == null) return;
        String json = String.format(
                "{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\"}",
                JsonUtils.escape(c.getId()),
                JsonUtils.escape(c.getName()),
                JsonUtils.escape(c.getEmail()),
                JsonUtils.escape(c.getPhone())
        );
        client.insert("customers", json);
    }

    // ==========================================
    // RESERVATIONS
    // ==========================================

    public List<Reservation> loadReservations(Map<String, Room> rooms, Map<String, Customer> customers) {
        if (!client.isConfigured()) return Collections.emptyList();
        List<Reservation> list = new ArrayList<>();

        try {
            SupabaseResponse resp = client.get("reservations", "select=*&order=created_at.desc");
            if (!resp.success || resp.body.trim().isEmpty() || "[]".equals(resp.body.trim())) {
                return list;
            }

            List<Map<String, String>> rows = JsonUtils.parseJsonArray(resp.body);
            for (Map<String, String> row : rows) {
                String resId = row.get("reservation_id");
                String custId = row.get("customer_id");
                String roomNum = row.get("room_number");
                String checkInStr = row.get("check_in_date");
                String checkOutStr = row.get("check_out_date");
                String statusStr = row.get("status");
                String totalStr = row.get("total_amount");
                String requests = row.get("special_requests");
                String createdAtStr = row.get("created_at");

                Customer cust = customers.get(custId);
                if (cust == null) {
                    cust = new Customer(custId != null ? custId : "CUST-UNKNOWN", "Guest " + resId, "guest@hotel.com", "+1 555-0000");
                }

                Room room = rooms.get(roomNum);
                if (room == null) {
                    room = new StandardRoom(roomNum != null ? roomNum : "101", 110.0, 2, true, "Standard Room");
                }

                LocalDate checkIn = checkInStr != null ? LocalDate.parse(checkInStr.substring(0, 10)) : LocalDate.now();
                LocalDate checkOut = checkOutStr != null ? LocalDate.parse(checkOutStr.substring(0, 10)) : checkIn.plusDays(1);

                Reservation res = new Reservation(resId, cust, room, checkIn, checkOut);
                if (requests != null) res.setSpecialRequests(requests);
                if (statusStr != null) res.setStatus(ReservationStatus.fromString(statusStr));
                if (totalStr != null) {
                    try {
                        res.setTotalAmount(Double.parseDouble(totalStr));
                    } catch (NumberFormatException ignored) {}
                }

                list.add(res);
            }
            AppLogger.info("[Supabase] Successfully loaded " + list.size() + " reservations from Supabase DB.");
        } catch (Exception e) {
            AppLogger.error("[Supabase] Error loading reservations: " + e.getMessage(), e);
        }
        return list;
    }

    public void insertReservation(Reservation res) {
        if (!client.isConfigured() || res == null) return;
        String json = String.format(Locale.US,
                "{\"reservation_id\":\"%s\",\"customer_id\":\"%s\",\"room_number\":\"%s\",\"check_in_date\":\"%s\",\"check_out_date\":\"%s\",\"status\":\"%s\",\"number_of_nights\":%d,\"total_amount\":%.2f,\"special_requests\":\"%s\"}",
                JsonUtils.escape(res.getReservationId()),
                JsonUtils.escape(res.getCustomer() != null ? res.getCustomer().getId() : ""),
                JsonUtils.escape(res.getRoom() != null ? res.getRoom().getRoomNumber() : ""),
                res.getCheckInDate() != null ? res.getCheckInDate().format(DATE_FORMAT) : "",
                res.getCheckOutDate() != null ? res.getCheckOutDate().format(DATE_FORMAT) : "",
                res.getStatus().name(),
                res.getNumberOfNights(),
                res.getTotalAmount(),
                JsonUtils.escape(res.getSpecialRequests())
        );
        client.insert("reservations", json);
    }

    public void updateReservation(Reservation res) {
        if (!client.isConfigured() || res == null) return;
        String json = String.format(Locale.US,
                "{\"room_number\":\"%s\",\"check_in_date\":\"%s\",\"check_out_date\":\"%s\",\"status\":\"%s\",\"number_of_nights\":%d,\"total_amount\":%.2f,\"special_requests\":\"%s\"}",
                JsonUtils.escape(res.getRoom() != null ? res.getRoom().getRoomNumber() : ""),
                res.getCheckInDate() != null ? res.getCheckInDate().format(DATE_FORMAT) : "",
                res.getCheckOutDate() != null ? res.getCheckOutDate().format(DATE_FORMAT) : "",
                res.getStatus().name(),
                res.getNumberOfNights(),
                res.getTotalAmount(),
                JsonUtils.escape(res.getSpecialRequests())
        );
        client.update("reservations", "reservation_id=eq." + res.getReservationId(), json);
    }

    public void deleteReservation(String reservationId) {
        if (!client.isConfigured() || reservationId == null) return;
        client.delete("reservations", "reservation_id=eq." + reservationId);
    }

    private double parseDouble(String str, double def) {
        if (str == null) return def;
        try {
            return Double.parseDouble(str.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    private int parseInt(String str, int def) {
        if (str == null) return def;
        try {
            return Integer.parseInt(str.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }
}
