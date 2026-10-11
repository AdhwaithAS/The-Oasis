package com.hotel.data;

import com.hotel.model.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * DataManager handles persistent CSV file storage and retrieval.
 * Implements Section 4.9 and Section 8 (DataManager) of the Project Report.
 */
public class DataManager {
    private final String dataDir;
    private final Path roomsPath;
    private final Path customersPath;
    private final Path reservationsPath;
    private final Path usersPath;

    public DataManager(String dataDir) {
        this.dataDir = dataDir;
        this.roomsPath = Paths.get(dataDir, "rooms.csv");
        this.customersPath = Paths.get(dataDir, "customers.csv");
        this.reservationsPath = Paths.get(dataDir, "reservations.csv");
        this.usersPath = Paths.get(dataDir, "users.csv");
        initDirectory();
    }

    private void initDirectory() {
        try {
            Files.createDirectories(Paths.get(dataDir));
        } catch (IOException e) {
            System.err.println("Could not create data directory: " + e.getMessage());
        }
    }

    // ==========================================
    // ROOMS PERSISTENCE
    // ==========================================

    public synchronized List<Room> loadRooms() {
        List<Room> rooms = new ArrayList<>();
        if (!Files.exists(roomsPath)) {
            rooms = createDefaultRooms();
            saveRooms(rooms);
            return rooms;
        }

        try (BufferedReader reader = Files.newBufferedReader(roomsPath, StandardCharsets.UTF_8)) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }
                if (line.trim().isEmpty()) continue;

                List<String> cols = parseCsvLine(line);
                if (cols.size() >= 6) {
                    String number = cols.get(0).trim();
                    String type = cols.get(1).trim();
                    double price = Double.parseDouble(cols.get(2).trim());
                    int capacity = Integer.parseInt(cols.get(3).trim());
                    boolean available = Boolean.parseBoolean(cols.get(4).trim());
                    String desc = cols.get(5).trim();

                    if ("Suite".equalsIgnoreCase(type)) {
                        rooms.add(new SuiteRoom(number, price, capacity, available, desc));
                    } else {
                        rooms.add(new StandardRoom(number, price, capacity, available, desc));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading rooms.csv: " + e.getMessage() + ". Generating default rooms.");
            rooms = createDefaultRooms();
            saveRooms(rooms);
        }

        if (rooms.isEmpty()) {
            rooms = createDefaultRooms();
            saveRooms(rooms);
        }

        return rooms;
    }

    public synchronized void saveRooms(List<Room> rooms) {
        try (BufferedWriter writer = Files.newBufferedWriter(roomsPath, StandardCharsets.UTF_8)) {
            writer.write("roomNumber,roomType,basePricePerNight,capacity,isAvailable,description\n");
            for (Room room : rooms) {
                writer.write(room.toCsvRow());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error saving rooms to CSV: " + e.getMessage());
        }
    }

    private List<Room> createDefaultRooms() {
        List<Room> list = new ArrayList<>();
        list.add(new StandardRoom("101", 110.00, 2, true, "Comfort Queen Room on 1st Floor overlooking courtyard garden."));
        list.add(new StandardRoom("102", 110.00, 2, true, "Deluxe Twin Queen Beds with ergonomic workspace and coffee bar."));
        list.add(new StandardRoom("103", 115.00, 2, true, "Quiet Standard Corner Room with extra natural sunlight and desk."));
        list.add(new StandardRoom("104", 120.00, 2, true, "Accessible Ground Floor Standard Room with walk-in shower."));
        list.add(new SuiteRoom("201", 240.00, 4, true, "Executive Presidential Suite with private jacuzzi and skyline terrace."));
        list.add(new SuiteRoom("202", 230.00, 4, true, "Royal Penthouse Suite with master king bed, lounge bar, and butler access."));
        list.add(new SuiteRoom("203", 220.00, 3, true, "Family Grand Suite with dual balconies, jacuzzi tub, and kid's lounge."));
        return list;
    }

    // ==========================================
    // CUSTOMERS PERSISTENCE
    // ==========================================

    public synchronized Map<String, Customer> loadCustomers() {
        Map<String, Customer> map = new LinkedHashMap<>();
        if (!Files.exists(customersPath)) {
            List<Customer> sampleCustomers = createDefaultCustomers();
            saveCustomers(sampleCustomers);
            for (Customer c : sampleCustomers) {
                map.put(c.getId(), c);
            }
            return map;
        }

        try (BufferedReader reader = Files.newBufferedReader(customersPath, StandardCharsets.UTF_8)) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                if (line.trim().isEmpty()) continue;
                List<String> cols = parseCsvLine(line);
                if (cols.size() >= 4) {
                    String id = cols.get(0).trim();
                    String name = cols.get(1).trim();
                    String email = cols.get(2).trim();
                    String phone = cols.get(3).trim();
                    map.put(id, new Customer(id, name, email, phone));
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading customers.csv: " + e.getMessage());
        }

        return map;
    }

    public synchronized void saveCustomers(Collection<Customer> customers) {
        try (BufferedWriter writer = Files.newBufferedWriter(customersPath, StandardCharsets.UTF_8)) {
            writer.write("id,name,email,phone\n");
            for (Customer c : customers) {
                writer.write(c.toCsvRow());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error saving customers to CSV: " + e.getMessage());
        }
    }

    private List<Customer> createDefaultCustomers() {
        List<Customer> list = new ArrayList<>();
        list.add(new Customer("CUST-101", "Adhwaith AS", "adhwaith@example.com", "+91 98471 23456"));
        list.add(new Customer("CUST-102", "Arjun B", "arjun.b@example.com", "+91 98472 34567"));
        list.add(new Customer("CUST-103", "Martin Job", "martin.job@example.com", "+91 98473 45678"));
        list.add(new Customer("CUST-104", "Naveen S", "naveen.s@example.com", "+91 98474 56789"));
        list.add(new Customer("CUST-105", "Sophia Taylor", "sophia.taylor@acme.org", "+1 (555) 321-9876"));
        return list;
    }

    // ==========================================
    // RESERVATIONS PERSISTENCE
    // ==========================================

    public synchronized List<Reservation> loadReservations(Map<String, Room> roomsMap, Map<String, Customer> customersMap) {
        List<Reservation> list = new ArrayList<>();
        if (!Files.exists(reservationsPath)) {
            list = createDefaultReservations(roomsMap, customersMap);
            saveReservations(list);
            return list;
        }

        try (BufferedReader reader = Files.newBufferedReader(reservationsPath, StandardCharsets.UTF_8)) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                if (line.trim().isEmpty()) continue;
                List<String> cols = parseCsvLine(line);
                if (cols.size() >= 7) {
                    String resId = cols.get(0).trim();
                    String custId = cols.get(1).trim();
                    String roomNum = cols.get(2).trim();
                    LocalDate checkIn = LocalDate.parse(cols.get(3).trim());
                    LocalDate checkOut = LocalDate.parse(cols.get(4).trim());
                    ReservationStatus status = ReservationStatus.fromString(cols.get(5).trim());
                    double total = Double.parseDouble(cols.get(6).trim());
                    LocalDateTime createdAt = cols.size() >= 8 && !cols.get(7).trim().isEmpty()
                            ? LocalDateTime.parse(cols.get(7).trim()) : LocalDateTime.now();
                    String requests = cols.size() >= 9 ? cols.get(8).trim() : "";

                    Customer customer = customersMap.get(custId);
                    if (customer == null) {
                        customer = new Customer(custId, "Guest " + custId, "guest@hotel.com", "+1 000-000-0000");
                    }

                    Room room = roomsMap.get(roomNum);

                    Reservation res = new Reservation(resId, customer, room, checkIn, checkOut, status, total, createdAt, requests);
                    list.add(res);
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading reservations.csv: " + e.getMessage());
            list = createDefaultReservations(roomsMap, customersMap);
            saveReservations(list);
        }

        return list;
    }

    public synchronized void saveReservations(List<Reservation> reservations) {
        try (BufferedWriter writer = Files.newBufferedWriter(reservationsPath, StandardCharsets.UTF_8)) {
            writer.write("reservationId,customerId,roomNumber,checkInDate,checkOutDate,status,totalAmount,createdAt,specialRequests\n");
            for (Reservation res : reservations) {
                writer.write(res.toCsvRow());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error saving reservations to CSV: " + e.getMessage());
        }
    }

    private List<Reservation> createDefaultReservations(Map<String, Room> roomsMap, Map<String, Customer> customersMap) {
        List<Reservation> list = new ArrayList<>();
        LocalDate today = LocalDate.now();

        Customer c1 = customersMap.get("CUST-101");
        Customer c2 = customersMap.get("CUST-102");
        Customer c3 = customersMap.get("CUST-103");
        Customer c4 = customersMap.get("CUST-104");

        Room r101 = roomsMap.get("101");
        Room r201 = roomsMap.get("201");
        Room r102 = roomsMap.get("102");
        Room r202 = roomsMap.get("202");

        if (c1 != null && r101 != null) {
            Reservation res1 = new Reservation("RES-1001", c1, r101, today, today.plusDays(3));
            res1.setStatus(ReservationStatus.CHECKED_IN);
            res1.setSpecialRequests("Late check-in requested; extra towels");
            res1.recalculateTotalAmount();
            list.add(res1);
        }

        if (c2 != null && r201 != null) {
            Reservation res2 = new Reservation("RES-1002", c2, r201, today.plusDays(1), today.plusDays(4));
            res2.setStatus(ReservationStatus.BOOKED);
            res2.setSpecialRequests("Champagne and fruits in suite on arrival");
            res2.recalculateTotalAmount();
            list.add(res2);
        }

        if (c3 != null && r102 != null) {
            Reservation res3 = new Reservation("RES-1003", c3, r102, today.minusDays(4), today.minusDays(1));
            res3.setStatus(ReservationStatus.CHECKED_OUT);
            res3.setSpecialRequests("High floor preference");
            res3.recalculateTotalAmount();
            list.add(res3);
        }

        if (c4 != null && r202 != null) {
            Reservation res4 = new Reservation("RES-1004", c4, r202, today, today.plusDays(2));
            res4.setStatus(ReservationStatus.CHECKED_IN);
            res4.setSpecialRequests("Airport pickup arranged");
            res4.recalculateTotalAmount();
            list.add(res4);
        }

        return list;
    }

    // ==========================================
    // USERS (RBAC) PERSISTENCE
    // ==========================================

    public synchronized Map<String, User> loadUsers() {
        Map<String, User> map = new LinkedHashMap<>();
        if (!Files.exists(usersPath)) {
            List<User> defaultUsers = createDefaultUsers();
            saveUsers(defaultUsers);
            for (User u : defaultUsers) {
                map.put(u.getEmail().toLowerCase(), u);
            }
            return map;
        }

        try (BufferedReader reader = Files.newBufferedReader(usersPath, StandardCharsets.UTF_8)) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                if (line.trim().isEmpty()) continue;
                List<String> cols = parseCsvLine(line);
                if (cols.size() >= 6) {
                    String id = cols.get(0).trim();
                    String name = cols.get(1).trim();
                    String email = cols.get(2).trim();
                    String password = cols.get(3).trim();
                    String phone = cols.get(4).trim();
                    UserRole role = UserRole.fromString(cols.get(5).trim());
                    LocalDateTime createdAt = cols.size() >= 7 && !cols.get(6).trim().isEmpty()
                            ? LocalDateTime.parse(cols.get(6).trim()) : LocalDateTime.now();

                    User user = new User(id, name, email, password, phone, role, createdAt);
                    map.put(email.toLowerCase(), user);
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading users.csv: " + e.getMessage());
            List<User> defaultUsers = createDefaultUsers();
            saveUsers(defaultUsers);
            for (User u : defaultUsers) {
                map.put(u.getEmail().toLowerCase(), u);
            }
        }

        return map;
    }

    public synchronized void saveUsers(Collection<User> users) {
        try (BufferedWriter writer = Files.newBufferedWriter(usersPath, StandardCharsets.UTF_8)) {
            writer.write("id,name,email,password,phone,role,createdAt\n");
            for (User u : users) {
                writer.write(u.toCsvRow());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error saving users to CSV: " + e.getMessage());
        }
    }

    private List<User> createDefaultUsers() {
        List<User> list = new ArrayList<>();
        list.add(new User("USER-1", "Adhwaith AS", "admin@hotel.com", "admin123", "+91 98471 23456", UserRole.ADMIN));
        list.add(new User("USER-2", "Arjun B", "staff@hotel.com", "staff123", "+91 98472 34567", UserRole.STAFF));
        list.add(new User("USER-3", "Kristin Watson", "guest@hotel.com", "guest123", "+1 555-432-8765", UserRole.GUEST));
        return list;
    }

    /**
     * CSV line parser supporting quoted strings with commas and escaped quotes.
     */
    private List<String> parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '\"') {
                    sb.append('\"');
                    i++; // Skip escaped quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString());
        return tokens;
    }
}
