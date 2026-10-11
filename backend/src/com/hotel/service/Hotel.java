package com.hotel.service;

import com.hotel.data.DataManager;
import com.hotel.exception.ReservationNotFoundException;
import com.hotel.exception.RoomNotAvailableException;
import com.hotel.exception.ValidationException;
import com.hotel.model.*;
import com.hotel.data.SupabaseDataManager;
import com.hotel.supabase.SupabaseClient;
import com.hotel.supabase.SupabaseClient.SupabaseResponse;
import com.hotel.util.AppLogger;
import com.hotel.util.JsonUtils;
import com.hotel.util.Validation;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Hotel service managing rooms, reservations, billing, and hotel operations.
 * Implements Section 8 (Hotel class) and core system workflow with Supabase PostgreSQL sync.
 */
public class Hotel {
    private final String hotelName;
    private final DataManager dataManager;
    private final SupabaseClient supabaseClient;
    private final SupabaseDataManager supabaseDataManager;
    private final Map<String, Room> rooms = new LinkedHashMap<>();
    private final Map<String, Customer> customers = new ConcurrentHashMap<>();
    private final List<Reservation> reservations = Collections.synchronizedList(new ArrayList<>());
    private final Map<String, User> users = new ConcurrentHashMap<>();

    public Hotel(String hotelName, String dataDir) {
        this.hotelName = hotelName;
        this.dataManager = new DataManager(dataDir);
        this.supabaseClient = new SupabaseClient();
        this.supabaseDataManager = new SupabaseDataManager(this.supabaseClient);
        loadInitialData();
    }

    private synchronized void loadInitialData() {
        if (supabaseClient.isConfigured()) {
            AppLogger.info("[Hotel] Supabase DB configured at " + supabaseClient.getSupabaseUrl());
            // 1. Load Rooms from Supabase DB
            List<Room> sbRooms = supabaseDataManager.loadRooms();
            if (sbRooms.isEmpty()) {
                AppLogger.info("[Hotel] Supabase rooms table empty. Seeding default rooms...");
                List<Room> defaultRooms = dataManager.loadRooms();
                supabaseDataManager.seedRooms(defaultRooms);
                for (Room r : defaultRooms) {
                    rooms.put(r.getRoomNumber(), r);
                }
            } else {
                for (Room r : sbRooms) {
                    rooms.put(r.getRoomNumber(), r);
                }
            }

            // 2. Load Customers from Supabase DB
            Map<String, Customer> sbCustomers = supabaseDataManager.loadCustomers();
            customers.putAll(sbCustomers);

            // 3. Load Reservations from Supabase DB
            List<Reservation> sbReservations = supabaseDataManager.loadReservations(rooms, customers);
            reservations.addAll(sbReservations);
        } else {
            AppLogger.warn("[Hotel] Supabase not configured in .env. Running in Local Storage Mode (CSV files).");
            // 1. Load Rooms from CSV
            List<Room> loadedRooms = dataManager.loadRooms();
            for (Room r : loadedRooms) {
                rooms.put(r.getRoomNumber(), r);
            }

            // 2. Load Customers from CSV
            Map<String, Customer> loadedCustomers = dataManager.loadCustomers();
            customers.putAll(loadedCustomers);

            // 3. Load Reservations from CSV
            List<Reservation> loadedReservations = dataManager.loadReservations(rooms, customers);
            reservations.addAll(loadedReservations);
        }

        // 4. Load Users (RBAC)
        Map<String, User> loadedUsers = dataManager.loadUsers();
        users.putAll(loadedUsers);

        // Update room availability based on current CHECKED_IN reservations
        syncRoomAvailability();
    }

    private void syncRoomAvailability() {
        LocalDate today = LocalDate.now();
        Set<String> currentlyOccupiedRooms = reservations.stream()
                .filter(res -> res.getStatus() == ReservationStatus.CHECKED_IN)
                .map(res -> res.getRoom().getRoomNumber())
                .collect(Collectors.toSet());

        for (Room r : rooms.values()) {
            r.setAvailable(!currentlyOccupiedRooms.contains(r.getRoomNumber()));
        }
    }

    public String getHotelName() {
        return hotelName;
    }

    public synchronized List<Room> getAllRooms() {
        syncRoomAvailability();
        return new ArrayList<>(rooms.values());
    }

    public Room getRoomByNumber(String roomNumber) {
        return rooms.get(roomNumber);
    }

    /**
     * Checks if a room has conflicting active reservations for the requested dates.
     */
    public synchronized boolean isRoomAvailableForDates(String roomNumber, LocalDate checkIn, LocalDate checkOut, String ignoreReservationId) {
        Room r = rooms.get(roomNumber);
        if (r == null) return false;

        for (Reservation res : reservations) {
            if (ignoreReservationId != null && res.getReservationId().equalsIgnoreCase(ignoreReservationId)) {
                continue;
            }
            if (res.getStatus() == ReservationStatus.CANCELLED || res.getStatus() == ReservationStatus.CHECKED_OUT) {
                continue;
            }
            if (res.getRoom().getRoomNumber().equals(roomNumber)) {
                // Check date overlap: (checkIn < res.checkOut) && (checkOut > res.checkIn)
                if (checkIn.isBefore(res.getCheckOutDate()) && checkOut.isAfter(res.getCheckInDate())) {
                    return false;
                }
            }
        }
        return true;
    }

    public synchronized List<Room> getAvailableRooms(LocalDate checkIn, LocalDate checkOut, String roomType) {
        List<Room> available = new ArrayList<>();
        for (Room r : rooms.values()) {
            if (roomType != null && !roomType.trim().isEmpty() && !r.getRoomType().equalsIgnoreCase(roomType.trim())) {
                continue;
            }
            if (isRoomAvailableForDates(r.getRoomNumber(), checkIn, checkOut, null)) {
                available.add(r);
            }
        }
        return available;
    }

    /**
     * Books a room: validates input, finds available room, generates ID, creates reservation, and persists to CSV.
     */
    public synchronized Reservation bookRoom(String customerName, String email, String phone,
                                            String roomType, String specificRoomNumber,
                                            LocalDate checkIn, LocalDate checkOut,
                                            String specialRequests)
            throws ValidationException, RoomNotAvailableException {

        // 1. Input Validation
        Validation.validateCustomer(customerName, email, phone);
        Validation.validateDates(checkIn, checkOut);
        if (roomType != null && !roomType.trim().isEmpty()) {
            Validation.validateRoomType(roomType);
        }

        // 2. Select Room
        Room selectedRoom = null;
        if (specificRoomNumber != null && !specificRoomNumber.trim().isEmpty()) {
            selectedRoom = rooms.get(specificRoomNumber.trim());
            if (selectedRoom == null) {
                throw new RoomNotAvailableException("Room number " + specificRoomNumber + " does not exist.");
            }
            if (!isRoomAvailableForDates(selectedRoom.getRoomNumber(), checkIn, checkOut, null)) {
                throw new RoomNotAvailableException("Room " + specificRoomNumber + " is not available for the selected dates (" + checkIn + " to " + checkOut + ").");
            }
        } else {
            List<Room> availableList = getAvailableRooms(checkIn, checkOut, roomType);
            if (availableList.isEmpty()) {
                throw new RoomNotAvailableException("No " + (roomType != null ? roomType : "") + " rooms available for the selected dates.");
            }
            selectedRoom = availableList.get(0);
        }

        // 3. Customer handling
        Customer customer = findOrCreateCustomer(customerName, email, phone);

        // 4. Generate Unique Reservation ID
        String reservationId = generateUniqueReservationId();

        // 5. Create Reservation
        Reservation reservation = new Reservation(reservationId, customer, selectedRoom, checkIn, checkOut);
        reservation.setSpecialRequests(specialRequests != null ? specialRequests.trim() : "");
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.recalculateTotalAmount();

        reservations.add(0, reservation); // Add at top of list
        syncRoomAvailability();

        // 6. Persist changes to CSV and Supabase DB
        dataManager.saveReservations(reservations);
        dataManager.saveCustomers(customers.values());
        if (supabaseClient.isConfigured()) {
            supabaseDataManager.saveCustomer(customer);
            supabaseDataManager.insertReservation(reservation);
            supabaseClient.logAudit("BOOK_RESERVATION", customer.getEmail(), "GUEST", reservation.getReservationId(), "Booked Room " + selectedRoom.getRoomNumber() + " (₹" + reservation.getTotalAmount() + ")", null, "SUCCESS");
        }

        return reservation;
    }

    private Customer findOrCreateCustomer(String name, String email, String phone) {
        for (Customer c : customers.values()) {
            if (c.getEmail().equalsIgnoreCase(email.trim())) {
                c.setName(name.trim());
                c.setPhone(phone.trim());
                return c;
            }
        }
        String custId = "CUST-" + (100 + customers.size() + 1);
        Customer newCustomer = new Customer(custId, name.trim(), email.trim(), phone.trim());
        customers.put(custId, newCustomer);
        return newCustomer;
    }

    private synchronized String generateUniqueReservationId() {
        int maxId = 1000;
        for (Reservation r : reservations) {
            String idStr = r.getReservationId();
            if (idStr.startsWith("RES-")) {
                try {
                    int num = Integer.parseInt(idStr.substring(4));
                    if (num > maxId) maxId = num;
                } catch (NumberFormatException ignored) {}
            }
        }
        return "RES-" + (maxId + 1);
    }

    public synchronized Reservation getReservationById(String reservationId) throws ReservationNotFoundException {
        ValidationException.class.getSimpleName(); // Touch
        for (Reservation r : reservations) {
            if (r.getReservationId().equalsIgnoreCase(reservationId.trim())) {
                return r;
            }
        }
        throw new ReservationNotFoundException("Reservation with ID " + reservationId + " was not found.");
    }

    public synchronized Reservation checkIn(String reservationId) throws ReservationNotFoundException, ValidationException {
        Reservation res = getReservationById(reservationId);
        if (res.getStatus() == ReservationStatus.CHECKED_OUT) {
            throw new ValidationException("Cannot check in a guest that has already checked out.");
        }
        if (res.getStatus() == ReservationStatus.CANCELLED) {
            throw new ValidationException("Cannot check in a cancelled reservation.");
        }
        res.setStatus(ReservationStatus.CHECKED_IN);
        syncRoomAvailability();
        dataManager.saveReservations(reservations);
        if (supabaseClient.isConfigured()) {
            supabaseDataManager.updateReservation(res);
            supabaseClient.logAudit("CHECK_IN", res.getCustomer() != null ? res.getCustomer().getEmail() : "", "STAFF", reservationId, "Guest checked into room " + res.getRoom().getRoomNumber(), null, "SUCCESS");
        }
        return res;
    }

    public synchronized Reservation checkOut(String reservationId) throws ReservationNotFoundException, ValidationException {
        Reservation res = getReservationById(reservationId);
        if (res.getStatus() == ReservationStatus.CANCELLED) {
            throw new ValidationException("Cannot check out a cancelled reservation.");
        }
        res.setStatus(ReservationStatus.CHECKED_OUT);
        syncRoomAvailability();
        dataManager.saveReservations(reservations);
        if (supabaseClient.isConfigured()) {
            supabaseDataManager.updateReservation(res);
            supabaseClient.logAudit("CHECK_OUT", res.getCustomer() != null ? res.getCustomer().getEmail() : "", "STAFF", reservationId, "Guest checked out", null, "SUCCESS");
        }
        return res;
    }

    public synchronized Reservation cancelReservation(String reservationId) throws ReservationNotFoundException {
        Reservation res = getReservationById(reservationId);
        res.setStatus(ReservationStatus.CANCELLED);
        syncRoomAvailability();
        dataManager.saveReservations(reservations);
        if (supabaseClient.isConfigured()) {
            supabaseDataManager.updateReservation(res);
            supabaseClient.logAudit("CANCEL_RESERVATION", res.getCustomer() != null ? res.getCustomer().getEmail() : "", "USER", reservationId, "Reservation cancelled", null, "SUCCESS");
        }
        return res;
    }

    public synchronized void deleteReservation(String reservationId) throws ReservationNotFoundException {
        Reservation res = getReservationById(reservationId);
        reservations.remove(res);
        syncRoomAvailability();
        dataManager.saveReservations(reservations);
        if (supabaseClient.isConfigured()) {
            supabaseDataManager.deleteReservation(reservationId);
            supabaseClient.logAudit("DELETE_RESERVATION", "admin", "ADMIN", reservationId, "Reservation permanently deleted", null, "SUCCESS");
        }
    }

    public synchronized Reservation updateReservation(String reservationId, String customerName, String email,
                                                      String phone, String roomNumber, LocalDate checkIn,
                                                      LocalDate checkOut, String specialRequests)
            throws ReservationNotFoundException, ValidationException, RoomNotAvailableException {

        Reservation res = getReservationById(reservationId);
        Validation.validateCustomer(customerName, email, phone);
        Validation.validateDates(checkIn, checkOut);

        Room targetRoom = rooms.get(roomNumber);
        if (targetRoom == null) {
            throw new RoomNotAvailableException("Room " + roomNumber + " does not exist.");
        }

        if (!isRoomAvailableForDates(roomNumber, checkIn, checkOut, reservationId)) {
            throw new RoomNotAvailableException("Room " + roomNumber + " is not available for requested dates (" + checkIn + " to " + checkOut + ").");
        }

        // Update customer details
        Customer customer = res.getCustomer();
        if (customer != null) {
            customer.setName(customerName.trim());
            customer.setEmail(email.trim());
            customer.setPhone(phone.trim());
        }

        res.setRoom(targetRoom);
        res.setCheckInDate(checkIn);
        res.setCheckOutDate(checkOut);
        res.setSpecialRequests(specialRequests != null ? specialRequests.trim() : "");
        res.recalculateTotalAmount();

        syncRoomAvailability();
        dataManager.saveReservations(reservations);
        dataManager.saveCustomers(customers.values());
        if (supabaseClient.isConfigured()) {
            supabaseDataManager.updateReservation(res);
            if (customer != null) supabaseDataManager.saveCustomer(customer);
            supabaseClient.logAudit("UPDATE_RESERVATION", email, "USER", reservationId, "Reservation updated", null, "SUCCESS");
        }
        return res;
    }

    public Bill generateBill(String reservationId) throws ReservationNotFoundException {
        Reservation res = getReservationById(reservationId);
        return new Bill(res);
    }

    public synchronized List<Reservation> searchReservations(String query, String status, String roomType) {
        String q = query != null ? query.trim().toLowerCase() : "";
        String s = status != null ? status.trim().toUpperCase() : "";
        String rType = roomType != null ? roomType.trim().toLowerCase() : "";

        return reservations.stream().filter(res -> {
            if (!s.isEmpty() && !s.equalsIgnoreCase("ALL")) {
                if (!res.getStatus().name().equalsIgnoreCase(s)) return false;
            }
            if (!rType.isEmpty() && !rType.equalsIgnoreCase("ALL")) {
                if (res.getRoom() == null || !res.getRoom().getRoomType().toLowerCase().contains(rType)) {
                    return false;
                }
            }
            if (!q.isEmpty()) {
                boolean matchesId = res.getReservationId().toLowerCase().contains(q);
                boolean matchesGuest = res.getCustomer() != null && res.getCustomer().getName().toLowerCase().contains(q);
                boolean matchesEmail = res.getCustomer() != null && res.getCustomer().getEmail().toLowerCase().contains(q);
                boolean matchesPhone = res.getCustomer() != null && res.getCustomer().getPhone().toLowerCase().contains(q);
                boolean matchesRoom = res.getRoom() != null && res.getRoom().getRoomNumber().toLowerCase().contains(q);
                return matchesId || matchesGuest || matchesEmail || matchesPhone || matchesRoom;
            }
            return true;
        }).collect(Collectors.toList());
    }

    public synchronized Map<String, Object> getHotelStatistics() {
        syncRoomAvailability();
        Map<String, Object> stats = new LinkedHashMap<>();

        int totalRooms = rooms.size();
        long occupiedRooms = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN).count();
        long bookedReservations = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.BOOKED).count();
        long totalReservations = reservations.size();

        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100.0 : 0.0;

        double totalRevenue = reservations.stream()
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .mapToDouble(Reservation::getTotalAmount)
                .sum();

        long standardRoomsCount = rooms.values().stream().filter(r -> r instanceof StandardRoom).count();
        long suiteRoomsCount = rooms.values().stream().filter(r -> r instanceof SuiteRoom).count();

        LocalDate today = LocalDate.now();
        long checkInsToday = reservations.stream()
                .filter(r -> r.getCheckInDate().equals(today) && (r.getStatus() == ReservationStatus.BOOKED || r.getStatus() == ReservationStatus.CHECKED_IN))
                .count();

        long checkOutsToday = reservations.stream()
                .filter(r -> r.getCheckOutDate().equals(today) && r.getStatus() == ReservationStatus.CHECKED_IN)
                .count();

        stats.put("hotelName", hotelName);
        stats.put("totalRooms", totalRooms);
        stats.put("standardRoomsCount", standardRoomsCount);
        stats.put("suiteRoomsCount", suiteRoomsCount);
        stats.put("occupiedRooms", occupiedRooms);
        stats.put("availableRooms", Math.max(0, totalRooms - (int) occupiedRooms));
        stats.put("bookedReservations", bookedReservations);
        stats.put("totalReservations", totalReservations);
        stats.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0);
        stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        stats.put("checkInsToday", checkInsToday);
        stats.put("checkOutsToday", checkOutsToday);

        return stats;
    }

    // ==========================================
    // AUTHENTICATION & RBAC (Section 13)
    // ==========================================

    public synchronized AuthResult registerUserWithAuth(String name, String email, String phone, String password, UserRole role)
            throws ValidationException {
        Validation.validateCustomer(name, email, phone);
        if (password == null || password.trim().length() < 4) {
            throw new ValidationException("Password must be at least 4 characters long.");
        }

        String lowerEmail = email.trim().toLowerCase();
        UserRole assignedRole = role != null ? role : UserRole.GUEST;
        String token = "sess_usr_" + System.currentTimeMillis();
        boolean isSupabase = false;

        if (supabaseClient.isConfigured()) {
            SupabaseResponse resp = supabaseClient.signUp(name, lowerEmail, phone, password, assignedRole.name());
            if (resp.success) {
                isSupabase = true;
                String extractedToken = JsonUtils.extractField(resp.body, "access_token");
                if (extractedToken != null && !extractedToken.isEmpty()) {
                    token = extractedToken;
                }
                supabaseClient.logAudit("USER_SIGNUP", lowerEmail, assignedRole.name(), "AUTH", "Registered via Supabase GoTrue Auth", null, "SUCCESS");
            } else {
                AppLogger.warn("[Supabase Auth] Sign up returned code " + resp.statusCode + ": " + resp.body);
            }
        }

        String userId = "USER-" + (users.size() + 1);
        User newUser = new User(userId, name.trim(), lowerEmail, password.trim(), phone.trim(), assignedRole);
        users.put(lowerEmail, newUser);
        dataManager.saveUsers(users.values());

        // Ensure customer profile exists
        findOrCreateCustomer(name, email, phone);

        return new AuthResult(newUser, token, "Registration successful", isSupabase);
    }

    public synchronized User registerUser(String name, String email, String phone, String password, UserRole role)
            throws ValidationException {
        return registerUserWithAuth(name, email, phone, password, role).getUser();
    }

    public AuthResult authenticateWithAuth(String email, String password) throws ValidationException {
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new ValidationException("Email and password are required.");
        }

        String lowerEmail = email.trim().toLowerCase();
        boolean isSupabase = false;
        String token = null;
        User user = null;

        if (supabaseClient.isConfigured()) {
            SupabaseResponse resp = supabaseClient.signIn(lowerEmail, password);
            if (resp.success) {
                isSupabase = true;
                token = JsonUtils.extractField(resp.body, "access_token");

                // Parse user role from metadata if present
                String roleStr = JsonUtils.extractField(resp.body, "role");
                UserRole resolvedRole = UserRole.fromString(roleStr);

                user = users.get(lowerEmail);
                if (user == null) {
                    user = new User("USER-" + (users.size() + 1), lowerEmail.split("@")[0], lowerEmail, "", "", resolvedRole);
                    users.put(lowerEmail, user);
                } else if (resolvedRole != null && resolvedRole != UserRole.GUEST) {
                    user.setRole(resolvedRole);
                }

                supabaseClient.logAudit("USER_LOGIN", lowerEmail, user.getRole().name(), "AUTH", "Signed in via Supabase GoTrue Auth", null, "SUCCESS");
            } else {
                AppLogger.warn("[Supabase Auth] Remote sign in failed (" + resp.statusCode + "). Checking local credentials fallback.");
            }
        }

        // Local credential fallback (e.g. seeded admin or offline mode)
        if (user == null) {
            user = users.get(lowerEmail);
            if (user == null || !user.getPassword().equals(password.trim())) {
                throw new ValidationException("Invalid email or password.");
            }
            token = "sess_" + user.getId().toLowerCase() + "_" + System.currentTimeMillis();
        }

        if (token == null || token.isEmpty()) {
            token = "sess_" + user.getId().toLowerCase() + "_" + System.currentTimeMillis();
        }

        return new AuthResult(user, token, "Login successful", isSupabase);
    }

    public User authenticate(String email, String password) throws ValidationException {
        return authenticateWithAuth(email, password).getUser();
    }

    public User findUserByEmail(String email) {
        if (email == null) return null;
        return users.get(email.trim().toLowerCase());
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }

    public SupabaseClient getSupabaseClient() {
        return supabaseClient;
    }

    public SupabaseDataManager getSupabaseDataManager() {
        return supabaseDataManager;
    }
}
