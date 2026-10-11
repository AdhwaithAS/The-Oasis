package com.hotel.server;

import com.hotel.exception.HotelException;
import com.hotel.model.*;
import com.hotel.service.Hotel;
import com.hotel.supabase.SupabaseClient.SupabaseResponse;
import com.hotel.util.AppLogger;
import com.hotel.util.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Enterprise Embedded HTTP REST API Server using Java 21 standard library.
 * Integrates Supabase Auth, PostgreSQL DB sync, Role-Based Access Control (RBAC),
 * and structured HTTP & security audit logging.
 */
public class HotelServer {
    private final int port;
    private final Hotel hotel;
    private HttpServer server;

    public HotelServer(int port, Hotel hotel) {
        this.port = port;
        this.hotel = hotel;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(16));

        // Register routes
        server.createContext("/api/health", new HealthHandler(hotel));
        server.createContext("/api/stats", new StatsHandler(hotel));
        server.createContext("/api/rooms", new RoomsHandler(hotel));
        server.createContext("/api/reservations", new ReservationsHandler(hotel));
        server.createContext("/api/auth", new AuthHandler(hotel));
        server.createContext("/api/audit-logs", new AuditLogsHandler(hotel));

        server.start();
        AppLogger.info(">>> Hotel Reservation Backend Server started on port " + port);
        AppLogger.info(">>> REST API ready at http://localhost:" + port + "/api/");
        if (hotel.getSupabaseClient().isConfigured()) {
            AppLogger.info(">>> Supabase Connection: ACTIVE (" + hotel.getSupabaseClient().getSupabaseUrl() + ")");
        } else {
            AppLogger.warn(">>> Supabase Connection: OFFLINE/FALLBACK (Provide SUPABASE_URL and SUPABASE_ANON_KEY in .env)");
        }
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    // ==========================================
    // UTILITY METHODS FOR HTTP & RBAC HANDLING
    // ==========================================

    private static void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
        setCorsHeaders(exchange);
        byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String responseJson, long startTime, AuthContext auth) throws IOException {
        sendResponse(exchange, statusCode, responseJson);
        long duration = System.currentTimeMillis() - startTime;
        String user = auth != null && auth.isAuthenticated() ? auth.getEmail() : "";
        String role = auth != null ? auth.getRole().name() : "ANON";
        String ip = auth != null ? auth.getClientIp() : "127.0.0.1";
        AppLogger.http(exchange.getRequestMethod(), exchange.getRequestURI().getPath(), statusCode, duration, user, role, ip);
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[2048];
            int read;
            while ((read = is.read(buf)) != -1) {
                baos.write(buf, 0, read);
            }
            return baos.toString(StandardCharsets.UTF_8);
        }
    }

    private static Map<String, String> parseQueryParams(String query) {
        Map<String, String> params = new HashMap<>();
        if (query == null || query.isEmpty()) return params;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                try {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    params.put(key, val);
                } catch (Exception ignored) {}
            }
        }
        return params;
    }

    /**
     * Resolves authentication credentials and RBAC roles from the HTTP request.
     * Supports Supabase GoTrue JWT tokens as well as local fallback session tokens.
     */
    public static AuthContext resolveAuthContext(HttpExchange exchange, Hotel hotel) {
        String clientIp = exchange.getRemoteAddress() != null ? exchange.getRemoteAddress().getAddress().getHostAddress() : "127.0.0.1";
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");

        if (authHeader == null || authHeader.trim().isEmpty()) {
            return AuthContext.anonymous(clientIp);
        }

        String token = authHeader.trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        if (token.isEmpty()) {
            return AuthContext.anonymous(clientIp);
        }

        // 1. Supabase JWT Token Resolution
        if (hotel.getSupabaseClient().isConfigured() && token.contains(".")) {
            SupabaseResponse resp = hotel.getSupabaseClient().getUserFromToken(token);
            if (resp.success) {
                String email = JsonUtils.extractField(resp.body, "email");
                String roleStr = JsonUtils.extractField(resp.body, "role");
                String name = JsonUtils.extractField(resp.body, "name");
                UserRole role = UserRole.fromString(roleStr);

                User user = hotel.findUserByEmail(email);
                if (user == null && email != null) {
                    user = new User(token, name != null ? name : email.split("@")[0], email, "", "", role);
                }
                return new AuthContext(user, role, email, token, true, clientIp);
            }
        }

        // 2. Local Session Token Resolution
        for (User u : hotel.getAllUsers()) {
            if (token.toLowerCase().contains(u.getId().toLowerCase()) || token.toLowerCase().contains(u.getEmail().toLowerCase())) {
                return new AuthContext(u, u.getRole(), u.getEmail(), token, true, clientIp);
            }
        }

        return AuthContext.anonymous(clientIp);
    }

    // ==========================================
    // HTTP HANDLERS
    // ==========================================

    static class HealthHandler implements HttpHandler {
        private final Hotel hotel;
        public HealthHandler(Hotel hotel) { this.hotel = hotel; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            long start = System.currentTimeMillis();
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 204, "");
                return;
            }
            boolean sbConfigured = hotel.getSupabaseClient().isConfigured();
            String sbUrl = hotel.getSupabaseClient().getSupabaseUrl();
            String resp = String.format(
                    "{\"status\":\"UP\",\"service\":\"Hotel Reservation System Java Backend\",\"version\":\"2.0\",\"supabase\":{\"configured\":%b,\"url\":\"%s\"},\"storageMode\":\"%s\"}",
                    sbConfigured,
                    JsonUtils.escape(sbUrl),
                    sbConfigured ? "SUPABASE_CLOUD_DB" : "LOCAL_CSV_FALLBACK"
            );
            sendResponse(exchange, 200, resp, start, AuthContext.anonymous("127.0.0.1"));
        }
    }

    static class StatsHandler implements HttpHandler {
        private final Hotel hotel;
        public StatsHandler(Hotel hotel) { this.hotel = hotel; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            long start = System.currentTimeMillis();
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 204, "");
                return;
            }
            AuthContext auth = resolveAuthContext(exchange, hotel);
            try {
                Map<String, Object> stats = hotel.getHotelStatistics();
                sendResponse(exchange, 200, JsonUtils.statsToJson(stats), start, auth);
            } catch (Exception e) {
                AppLogger.error("[StatsHandler] Error calculating statistics: " + e.getMessage(), e);
                sendResponse(exchange, 500, JsonUtils.errorJson(e.getMessage(), 500), start, auth);
            }
        }
    }

    static class RoomsHandler implements HttpHandler {
        private final Hotel hotel;
        public RoomsHandler(Hotel hotel) { this.hotel = hotel; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            long start = System.currentTimeMillis();
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 204, "");
                return;
            }
            AuthContext auth = resolveAuthContext(exchange, hotel);

            try {
                String path = exchange.getRequestURI().getPath();
                String query = exchange.getRequestURI().getQuery();
                Map<String, String> params = parseQueryParams(query);

                if (path.endsWith("/available")) {
                    String checkInStr = params.get("checkIn");
                    String checkOutStr = params.get("checkOut");
                    String roomType = params.get("type");

                    LocalDate checkIn = checkInStr != null ? LocalDate.parse(checkInStr) : LocalDate.now();
                    LocalDate checkOut = checkOutStr != null ? LocalDate.parse(checkOutStr) : checkIn.plusDays(1);

                    List<Room> available = hotel.getAvailableRooms(checkIn, checkOut, roomType);
                    sendResponse(exchange, 200, JsonUtils.roomsListToJson(available), start, auth);
                } else {
                    List<Room> allRooms = hotel.getAllRooms();
                    sendResponse(exchange, 200, JsonUtils.roomsListToJson(allRooms), start, auth);
                }
            } catch (Exception e) {
                AppLogger.error("[RoomsHandler] Error handling request: " + e.getMessage(), e);
                sendResponse(exchange, 400, JsonUtils.errorJson(e.getMessage(), 400), start, auth);
            }
        }
    }

    static class ReservationsHandler implements HttpHandler {
        private final Hotel hotel;
        public ReservationsHandler(Hotel hotel) { this.hotel = hotel; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            long start = System.currentTimeMillis();
            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                sendResponse(exchange, 204, "");
                return;
            }

            AuthContext auth = resolveAuthContext(exchange, hotel);
            String path = exchange.getRequestURI().getPath();
            String subPath = path.substring("/api/reservations".length());
            if (subPath.startsWith("/")) subPath = subPath.substring(1);

            try {
                if (subPath.isEmpty()) {
                    // /api/reservations
                    if ("GET".equals(method)) {
                        Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
                        String q = params.get("q");
                        String status = params.get("status");
                        String roomType = params.get("roomType");

                        List<Reservation> results = hotel.searchReservations(q, status, roomType);

                        // RBAC Guest filter: Guests only view their own reservations
                        if (auth.isGuest() && !auth.getEmail().isEmpty()) {
                            results = results.stream()
                                    .filter(r -> r.getCustomer() != null && r.getCustomer().getEmail().equalsIgnoreCase(auth.getEmail()))
                                    .collect(Collectors.toList());
                        }

                        sendResponse(exchange, 200, JsonUtils.reservationsListToJson(results), start, auth);
                    } else if ("POST".equals(method)) {
                        String body = readRequestBody(exchange);
                        Map<String, String> data = JsonUtils.parseJsonObject(body);

                        String name = data.get("customerName");
                        String email = data.get("email");
                        String phone = data.get("phone");
                        String roomType = data.get("roomType");
                        String roomNumber = data.get("roomNumber");
                        String checkInStr = data.get("checkInDate");
                        String checkOutStr = data.get("checkOutDate");
                        String requests = data.get("specialRequests");

                        LocalDate checkIn = LocalDate.parse(checkInStr);
                        LocalDate checkOut = LocalDate.parse(checkOutStr);

                        Reservation created = hotel.bookRoom(name, email, phone, roomType, roomNumber, checkIn, checkOut, requests);
                        sendResponse(exchange, 201, JsonUtils.toJson(created), start, auth);
                    } else {
                        sendResponse(exchange, 405, JsonUtils.errorJson("Method Not Allowed", 405), start, auth);
                    }
                } else {
                    String[] parts = subPath.split("/");
                    String resId = parts[0];

                    if (parts.length == 1) {
                        // /api/reservations/{id}
                        if ("GET".equals(method)) {
                            Reservation res = hotel.getReservationById(resId);
                            // RBAC check: Guest cannot view other guests' reservation
                            if (auth.isGuest() && !auth.getEmail().isEmpty()) {
                                if (res.getCustomer() != null && !res.getCustomer().getEmail().equalsIgnoreCase(auth.getEmail())) {
                                    AppLogger.security("VIEW_RESERVATION", auth.getEmail(), auth.getRole().name(), false, "Forbidden attempt to view foreign reservation " + resId);
                                    sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: You do not have permission to view other guests' reservations.", 403), start, auth);
                                    return;
                                }
                            }
                            sendResponse(exchange, 200, JsonUtils.toJson(res), start, auth);
                        } else if ("DELETE".equals(method)) {
                            // RBAC Check: Only ADMIN can delete
                            if (!auth.isAdmin()) {
                                AppLogger.security("DELETE_RESERVATION", auth.getEmail(), auth.getRole().name(), false, "Denied non-admin deletion of " + resId);
                                sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: Administrator role required to permanently delete records.", 403), start, auth);
                                return;
                            }
                            hotel.deleteReservation(resId);
                            sendResponse(exchange, 200, JsonUtils.successJson("Reservation " + resId + " deleted successfully."), start, auth);
                        } else if ("PUT".equals(method)) {
                            // RBAC Check: Guest can only update their own
                            Reservation existing = hotel.getReservationById(resId);
                            if (auth.isGuest() && !auth.getEmail().isEmpty()) {
                                if (existing.getCustomer() != null && !existing.getCustomer().getEmail().equalsIgnoreCase(auth.getEmail())) {
                                    AppLogger.security("UPDATE_RESERVATION", auth.getEmail(), auth.getRole().name(), false, "Denied guest updating foreign reservation " + resId);
                                    sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: You can only modify your own reservation.", 403), start, auth);
                                    return;
                                }
                            }

                            String body = readRequestBody(exchange);
                            Map<String, String> data = JsonUtils.parseJsonObject(body);

                            String name = data.get("customerName");
                            String email = data.get("email");
                            String phone = data.get("phone");
                            String roomNumber = data.get("roomNumber");
                            String checkInStr = data.get("checkInDate");
                            String checkOutStr = data.get("checkOutDate");
                            String requests = data.get("specialRequests");

                            LocalDate checkIn = LocalDate.parse(checkInStr);
                            LocalDate checkOut = LocalDate.parse(checkOutStr);

                            Reservation updated = hotel.updateReservation(resId, name, email, phone, roomNumber, checkIn, checkOut, requests);
                            sendResponse(exchange, 200, JsonUtils.toJson(updated), start, auth);
                        } else {
                            sendResponse(exchange, 405, JsonUtils.errorJson("Method Not Allowed", 405), start, auth);
                        }
                    } else if (parts.length == 2) {
                        String action = parts[1].toLowerCase();
                        if ("checkin".equals(action) && "POST".equals(method)) {
                            // RBAC Check: Staff or Admin required
                            if (auth.isGuest()) {
                                AppLogger.security("CHECKIN_RESERVATION", auth.getEmail(), auth.getRole().name(), false, "Denied guest check-in attempt for " + resId);
                                sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: Front desk staff or Administrator role required for check-in.", 403), start, auth);
                                return;
                            }
                            Reservation res = hotel.checkIn(resId);
                            sendResponse(exchange, 200, JsonUtils.toJson(res), start, auth);
                        } else if ("checkout".equals(action) && "POST".equals(method)) {
                            // RBAC Check: Staff or Admin required
                            if (auth.isGuest()) {
                                AppLogger.security("CHECKOUT_RESERVATION", auth.getEmail(), auth.getRole().name(), false, "Denied guest check-out attempt for " + resId);
                                sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: Front desk staff or Administrator role required for check-out.", 403), start, auth);
                                return;
                            }
                            Reservation res = hotel.checkOut(resId);
                            sendResponse(exchange, 200, JsonUtils.toJson(res), start, auth);
                        } else if ("cancel".equals(action) && "POST".equals(method)) {
                            Reservation res = hotel.cancelReservation(resId);
                            sendResponse(exchange, 200, JsonUtils.toJson(res), start, auth);
                        } else if ("bill".equals(action) && "GET".equals(method)) {
                            Bill bill = hotel.generateBill(resId);
                            sendResponse(exchange, 200, JsonUtils.toJson(bill), start, auth);
                        } else {
                            sendResponse(exchange, 404, JsonUtils.errorJson("Unknown reservation action: " + action, 404), start, auth);
                        }
                    } else {
                        sendResponse(exchange, 404, JsonUtils.errorJson("Endpoint not found", 404), start, auth);
                    }
                }
            } catch (HotelException he) {
                sendResponse(exchange, he.getStatusCode(), JsonUtils.errorJson(he.getMessage(), he.getStatusCode()), start, auth);
            } catch (Exception e) {
                AppLogger.error("[ReservationsHandler] Uncaught error: " + e.getMessage(), e);
                sendResponse(exchange, 500, JsonUtils.errorJson("Server Error: " + e.getMessage(), 500), start, auth);
            }
        }
    }

    static class AuthHandler implements HttpHandler {
        private final Hotel hotel;
        public AuthHandler(Hotel hotel) { this.hotel = hotel; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            long start = System.currentTimeMillis();
            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                sendResponse(exchange, 204, "");
                return;
            }

            AuthContext auth = resolveAuthContext(exchange, hotel);
            String path = exchange.getRequestURI().getPath();
            String subPath = path.substring("/api/auth".length());
            if (subPath.startsWith("/")) subPath = subPath.substring(1);

            try {
                if ("login".equalsIgnoreCase(subPath) && "POST".equals(method)) {
                    String body = readRequestBody(exchange);
                    Map<String, String> data = JsonUtils.parseJsonObject(body);
                    String email = data.get("email");
                    String password = data.get("password");

                    AuthResult result = hotel.authenticateWithAuth(email, password);
                    sendResponse(exchange, 200, JsonUtils.authResponseToJson(result.getUser(), result.getToken(), result.getMessage()), start, auth);
                } else if ("register".equalsIgnoreCase(subPath) && "POST".equals(method)) {
                    String body = readRequestBody(exchange);
                    Map<String, String> data = JsonUtils.parseJsonObject(body);
                    String name = data.get("name");
                    String email = data.get("email");
                    String phone = data.get("phone");
                    String password = data.get("password");
                    String roleStr = data.get("role");

                    UserRole role = UserRole.fromString(roleStr);

                    // RBAC Rule: Only an authenticated Administrator can create STAFF or ADMIN accounts
                    if ((role == UserRole.ADMIN || role == UserRole.STAFF) && !auth.isAdmin()) {
                        AppLogger.security("CREATE_PRIVILEGED_USER", auth.getEmail(), auth.getRole().name(), false,
                                "Unauthorized attempt to create privileged role: " + role);
                        sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: Only hotel administrators can create new Staff or Admin accounts.", 403), start, auth);
                        return;
                    }

                    AuthResult result = hotel.registerUserWithAuth(name, email, phone, password, role);
                    sendResponse(exchange, 201, JsonUtils.authResponseToJson(result.getUser(), result.getToken(), result.getMessage()), start, auth);
                } else if ("me".equalsIgnoreCase(subPath) && "GET".equals(method)) {
                    if (!auth.isAuthenticated()) {
                        sendResponse(exchange, 401, JsonUtils.errorJson("Unauthorized: No active session or token.", 401), start, auth);
                        return;
                    }
                    sendResponse(exchange, 200, JsonUtils.toJson(auth.getUser()), start, auth);
                } else if ("users".equalsIgnoreCase(subPath) && "GET".equals(method)) {
                    // RBAC Check: Admin only
                    if (!auth.isAdmin()) {
                        AppLogger.security("LIST_USERS", auth.getEmail(), auth.getRole().name(), false, "Unauthorized attempt to view user directory");
                        sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: Administrator role required to view user directory.", 403), start, auth);
                        return;
                    }
                    List<User> users = hotel.getAllUsers();
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < users.size(); i++) {
                        sb.append(JsonUtils.toJson(users.get(i)));
                        if (i < users.size() - 1) sb.append(",");
                    }
                    sb.append("]");
                    sendResponse(exchange, 200, sb.toString(), start, auth);
                } else {
                    sendResponse(exchange, 404, JsonUtils.errorJson("Auth endpoint not found: " + path, 404), start, auth);
                }
            } catch (HotelException he) {
                sendResponse(exchange, he.getStatusCode(), JsonUtils.errorJson(he.getMessage(), he.getStatusCode()), start, auth);
            } catch (Exception e) {
                AppLogger.error("[AuthHandler] Error: " + e.getMessage(), e);
                sendResponse(exchange, 500, JsonUtils.errorJson("Auth error: " + e.getMessage(), 500), start, auth);
            }
        }
    }

    static class AuditLogsHandler implements HttpHandler {
        private final Hotel hotel;
        public AuditLogsHandler(Hotel hotel) { this.hotel = hotel; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            long start = System.currentTimeMillis();
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 204, "");
                return;
            }
            AuthContext auth = resolveAuthContext(exchange, hotel);

            // Admin only
            if (!auth.isAdmin()) {
                AppLogger.security("VIEW_AUDIT_LOGS", auth.getEmail(), auth.getRole().name(), false, "Unauthorized attempt to view audit logs");
                sendResponse(exchange, 403, JsonUtils.errorJson("Access Denied: Administrator role required.", 403), start, auth);
                return;
            }

            // If Supabase is configured, fetch recent audit logs
            if (hotel.getSupabaseClient().isConfigured()) {
                SupabaseResponse resp = hotel.getSupabaseClient().get("audit_logs", "select=*&order=timestamp.desc&limit=50");
                if (resp.success) {
                    sendResponse(exchange, 200, resp.body, start, auth);
                    return;
                }
            }

            // Fallback response
            sendResponse(exchange, 200, "[]", start, auth);
        }
    }
}
