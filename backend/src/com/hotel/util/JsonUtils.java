package com.hotel.util;

import com.hotel.model.*;

import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Lightweight, zero-dependency JSON utility for serialization and deserialization.
 * Supports communication between Java backend and Next.js frontend.
 */
public class JsonUtils {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    public static String toJson(Customer c) {
        if (c == null) return "null";
        return String.format("{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\"}",
                escape(c.getId()), escape(c.getName()), escape(c.getEmail()), escape(c.getPhone()));
    }

    public static String toJson(User u) {
        if (u == null) return "null";
        return String.format("{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\",\"role\":\"%s\",\"createdAt\":\"%s\"}",
                escape(u.getId()), escape(u.getName()), escape(u.getEmail()), escape(u.getPhone()),
                u.getRole().name(), u.getCreatedAt() != null ? u.getCreatedAt().format(DATE_TIME_FORMAT) : "");
    }

    public static String authResponseToJson(User u, String token, String message) {
        return String.format("{\"success\":true,\"message\":\"%s\",\"token\":\"%s\",\"user\":%s}",
                escape(message), escape(token), toJson(u));
    }

    public static String toJson(Room r) {
        if (r == null) return "null";
        StringBuilder amenitiesJson = new StringBuilder("[");
        List<String> amenities = r.getAmenities();
        for (int i = 0; i < amenities.size(); i++) {
            amenitiesJson.append("\"").append(escape(amenities.get(i))).append("\"");
            if (i < amenities.size() - 1) amenitiesJson.append(",");
        }
        amenitiesJson.append("]");

        double luxuryFee = (r instanceof SuiteRoom) ? ((SuiteRoom) r).getLuxuryServiceFee() : 0.0;

        return String.format(Locale.US,
                "{\"roomNumber\":\"%s\",\"roomType\":\"%s\",\"basePricePerNight\":%.2f,\"capacity\":%d,\"isAvailable\":%b,\"description\":\"%s\",\"taxRate\":%.2f,\"luxuryServiceFee\":%.2f,\"amenities\":%s}",
                escape(r.getRoomNumber()), escape(r.getRoomType()), r.getBasePricePerNight(), r.getCapacity(),
                r.isAvailable(), escape(r.getDescription()), r.getTaxRate(), luxuryFee, amenitiesJson.toString());
    }

    public static String toJson(Reservation res) {
        if (res == null) return "null";
        return String.format(Locale.US,
                "{\"reservationId\":\"%s\",\"customer\":%s,\"room\":%s,\"checkInDate\":\"%s\",\"checkOutDate\":\"%s\",\"status\":\"%s\",\"numberOfNights\":%d,\"totalAmount\":%.2f,\"createdAt\":\"%s\",\"specialRequests\":\"%s\"}",
                escape(res.getReservationId()),
                toJson(res.getCustomer()),
                toJson(res.getRoom()),
                res.getCheckInDate() != null ? res.getCheckInDate().format(DATE_FORMAT) : "",
                res.getCheckOutDate() != null ? res.getCheckOutDate().format(DATE_FORMAT) : "",
                res.getStatus().name(),
                res.getNumberOfNights(),
                res.getTotalAmount(),
                res.getCreatedAt() != null ? res.getCreatedAt().format(DATE_TIME_FORMAT) : "",
                escape(res.getSpecialRequests()));
    }

    public static String toJson(Bill bill) {
        if (bill == null) return "null";
        return String.format(Locale.US,
                "{\"billId\":\"%s\",\"reservationId\":\"%s\",\"customerName\":\"%s\",\"customerEmail\":\"%s\",\"customerPhone\":\"%s\",\"roomNumber\":\"%s\",\"roomType\":\"%s\",\"checkInDate\":\"%s\",\"checkOutDate\":\"%s\",\"numberOfNights\":%d,\"ratePerNight\":%.2f,\"subtotal\":%.2f,\"taxRate\":%.2f,\"taxAmount\":%.2f,\"totalAmount\":%.2f,\"paymentStatus\":\"%s\",\"generatedAt\":\"%s\",\"formattedReceipt\":\"%s\"}",
                escape(bill.getBillId()),
                escape(bill.getReservationId()),
                escape(bill.getCustomerName()),
                escape(bill.getCustomerEmail()),
                escape(bill.getCustomerPhone()),
                escape(bill.getRoomNumber()),
                escape(bill.getRoomType()),
                bill.getCheckInDate() != null ? bill.getCheckInDate().format(DATE_FORMAT) : "",
                bill.getCheckOutDate() != null ? bill.getCheckOutDate().format(DATE_FORMAT) : "",
                bill.getNumberOfNights(),
                bill.getRatePerNight(),
                bill.getSubtotal(),
                bill.getTaxRate(),
                bill.getTaxAmount(),
                bill.getTotalAmount(),
                escape(bill.getPaymentStatus()),
                bill.getGeneratedAt() != null ? bill.getGeneratedAt().format(DATE_TIME_FORMAT) : "",
                escape(bill.getFormattedBill()));
    }

    public static String roomsListToJson(List<Room> rooms) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < rooms.size(); i++) {
            sb.append(toJson(rooms.get(i)));
            if (i < rooms.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public static String reservationsListToJson(List<Reservation> reservations) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < reservations.size(); i++) {
            sb.append(toJson(reservations.get(i)));
            if (i < reservations.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public static String statsToJson(Map<String, Object> stats) {
        StringBuilder sb = new StringBuilder("{");
        int count = 0;
        int size = stats.size();
        for (Map.Entry<String, Object> entry : stats.entrySet()) {
            sb.append("\"").append(escape(entry.getKey())).append("\":");
            Object val = entry.getValue();
            if (val instanceof Number || val instanceof Boolean) {
                sb.append(val);
            } else if (val instanceof String) {
                sb.append("\"").append(escape((String) val)).append("\"");
            } else {
                sb.append("\"").append(escape(String.valueOf(val))).append("\"");
            }
            if (++count < size) sb.append(",");
        }
        sb.append("}");
        return sb.toString();
    }

    public static String errorJson(String message, int status) {
        return String.format("{\"error\":true,\"message\":\"%s\",\"status\":%d}", escape(message), status);
    }

    public static String successJson(String message) {
        return String.format("{\"success\":true,\"message\":\"%s\"}", escape(message));
    }

    /**
     * Parses a simple JSON object into a key-value Map<String, String>.
     */
    public static Map<String, String> parseJsonObject(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;

        String trimmed = json.trim();
        if (trimmed.startsWith("{")) trimmed = trimmed.substring(1);
        if (trimmed.endsWith("}")) trimmed = trimmed.substring(0, trimmed.length() - 1);

        boolean inQuote = false;
        StringBuilder currentToken = new StringBuilder();
        List<String> pairs = new ArrayList<>();

        for (int i = 0; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            if (c == '\\' && i + 1 < trimmed.length()) {
                currentToken.append(c).append(trimmed.charAt(++i));
                continue;
            }
            if (c == '"') {
                inQuote = !inQuote;
                currentToken.append(c);
            } else if (c == ',' && !inQuote) {
                pairs.add(currentToken.toString().trim());
                currentToken.setLength(0);
            } else {
                currentToken.append(c);
            }
        }
        if (currentToken.length() > 0) {
            pairs.add(currentToken.toString().trim());
        }

        for (String pair : pairs) {
            int colonIdx = pair.indexOf(':');
            if (colonIdx > 0) {
                String key = cleanToken(pair.substring(0, colonIdx));
                String val = cleanToken(pair.substring(colonIdx + 1));
                map.put(key, val);
            }
        }
        return map;
    }

    /**
     * Parses a JSON array of objects: e.g. [{"a":"1"}, {"b":"2"}]
     */
    public static List<Map<String, String>> parseJsonArray(String json) {
        List<Map<String, String>> list = new ArrayList<>();
        if (json == null || json.trim().isEmpty()) return list;

        String trimmed = json.trim();
        if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return list;

        trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        if (trimmed.isEmpty()) return list;

        boolean inQuote = false;
        int braceDepth = 0;
        StringBuilder currentObject = new StringBuilder();

        for (int i = 0; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            if (c == '\\' && i + 1 < trimmed.length()) {
                currentObject.append(c).append(trimmed.charAt(++i));
                continue;
            }
            if (c == '"') {
                inQuote = !inQuote;
                currentObject.append(c);
            } else if (!inQuote && c == '{') {
                braceDepth++;
                currentObject.append(c);
            } else if (!inQuote && c == '}') {
                braceDepth--;
                currentObject.append(c);
                if (braceDepth == 0) {
                    list.add(parseJsonObject(currentObject.toString()));
                    currentObject.setLength(0);
                }
            } else if (!inQuote && c == ',' && braceDepth == 0) {
                // Separator between array items
                currentObject.setLength(0);
            } else if (braceDepth > 0) {
                currentObject.append(c);
            }
        }

        return list;
    }

    /**
     * Extracts a top-level string field value from a JSON string.
     */
    public static String extractField(String json, String field) {
        if (json == null || field == null) return null;
        String pattern = "\"" + field + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1) return null;

        int colon = json.indexOf(':', idx + pattern.length());
        if (colon == -1) return null;

        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) {
            start++;
        }
        if (start >= json.length()) return null;

        if (json.charAt(start) == '"') {
            int end = start + 1;
            while (end < json.length()) {
                if (json.charAt(end) == '"' && json.charAt(end - 1) != '\\') {
                    return unescape(json.substring(start + 1, end));
                }
                end++;
            }
        } else {
            // number, boolean, or null
            int end = start;
            while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}' && json.charAt(end) != ']' && !Character.isWhitespace(json.charAt(end))) {
                end++;
            }
            return json.substring(start, end).trim();
        }
        return null;
    }

    public static String cleanToken(String token) {
        String t = token.trim();
        if (t.startsWith("\"") && t.endsWith("\"") && t.length() >= 2) {
            t = t.substring(1, t.length() - 1);
        }
        return unescape(t);
    }

    public static String unescape(String s) {
        return s.replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t");
    }
}

