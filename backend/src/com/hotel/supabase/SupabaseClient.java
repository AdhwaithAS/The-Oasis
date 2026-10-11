package com.hotel.supabase;

import com.hotel.util.AppLogger;
import com.hotel.util.EnvConfig;
import com.hotel.util.JsonUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * Enterprise client for Supabase PostgreSQL REST API (PostgREST) and Supabase Auth (GoTrue).
 * Utilizes Java 21 native HttpClient with connection pooling, HTTP/2, and zero external dependencies.
 */
public class SupabaseClient {
    private final String supabaseUrl;
    private final String anonKey;
    private final String serviceRoleKey;
    private final HttpClient httpClient;
    private final boolean configured;

    public static class SupabaseResponse {
        public final int statusCode;
        public final String body;
        public final boolean success;

        public SupabaseResponse(int statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body != null ? body : "";
            this.success = statusCode >= 200 && statusCode < 300;
        }
    }

    public SupabaseClient() {
        String url = EnvConfig.get("SUPABASE_URL", "").trim();
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        this.supabaseUrl = url;
        this.anonKey = EnvConfig.get("SUPABASE_ANON_KEY", "").trim();
        this.serviceRoleKey = EnvConfig.get("SUPABASE_SERVICE_ROLE_KEY", "").trim();

        this.configured = !supabaseUrl.isEmpty() &&
                !supabaseUrl.contains("your-project") &&
                (!serviceRoleKey.isEmpty() || !anonKey.isEmpty());

        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isConfigured() {
        return configured;
    }

    public String getSupabaseUrl() {
        return supabaseUrl;
    }

    /**
     * Resolves the primary key for backend operations. Prefers SERVICE_ROLE_KEY to bypass RLS
     * for administrative server-side operations, falls back to ANON_KEY.
     */
    private String getEffectiveApiKey() {
        if (!serviceRoleKey.isEmpty() && !serviceRoleKey.contains("your-service-role-key")) {
            return serviceRoleKey;
        }
        return anonKey;
    }

    // ==========================================
    // DATABASE REST API (PostgREST)
    // ==========================================

    /**
     * Query table with PostgREST query parameters (e.g. "select=*&order=room_number.asc").
     */
    public SupabaseResponse get(String table, String queryParams) {
        if (!configured) return new SupabaseResponse(503, "{\"error\":\"Supabase not configured\"}");
        String url = supabaseUrl + "/rest/v1/" + table + (queryParams != null && !queryParams.isEmpty() ? "?" + queryParams : "");
        long start = System.currentTimeMillis();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("apikey", getEffectiveApiKey())
                    .header("Authorization", "Bearer " + getEffectiveApiKey())
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            long duration = System.currentTimeMillis() - start;
            AppLogger.supabase("GET", table, resp.statusCode(), duration + "ms");
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase] GET " + table + " failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    /**
     * Inserts a record or array of records into a table.
     */
    public SupabaseResponse insert(String table, String jsonPayload) {
        if (!configured) return new SupabaseResponse(503, "{\"error\":\"Supabase not configured\"}");
        String url = supabaseUrl + "/rest/v1/" + table;
        long start = System.currentTimeMillis();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("apikey", getEffectiveApiKey())
                    .header("Authorization", "Bearer " + getEffectiveApiKey())
                    .header("Content-Type", "application/json")
                    .header("Prefer", "return=representation,resolution=merge-duplicates")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            long duration = System.currentTimeMillis() - start;
            AppLogger.supabase("POST", table, resp.statusCode(), duration + "ms");
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase] POST " + table + " failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    /**
     * Updates matching records in a table using PostgREST PATCH.
     */
    public SupabaseResponse update(String table, String queryFilter, String jsonPayload) {
        if (!configured) return new SupabaseResponse(503, "{\"error\":\"Supabase not configured\"}");
        String url = supabaseUrl + "/rest/v1/" + table + "?" + queryFilter;
        long start = System.currentTimeMillis();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("apikey", getEffectiveApiKey())
                    .header("Authorization", "Bearer " + getEffectiveApiKey())
                    .header("Content-Type", "application/json")
                    .header("Prefer", "return=representation")
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            long duration = System.currentTimeMillis() - start;
            AppLogger.supabase("PATCH", table, resp.statusCode(), duration + "ms");
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase] PATCH " + table + " failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    /**
     * Deletes matching records from a table using PostgREST DELETE.
     */
    public SupabaseResponse delete(String table, String queryFilter) {
        if (!configured) return new SupabaseResponse(503, "{\"error\":\"Supabase not configured\"}");
        String url = supabaseUrl + "/rest/v1/" + table + "?" + queryFilter;
        long start = System.currentTimeMillis();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("apikey", getEffectiveApiKey())
                    .header("Authorization", "Bearer " + getEffectiveApiKey())
                    .header("Prefer", "return=representation")
                    .DELETE()
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            long duration = System.currentTimeMillis() - start;
            AppLogger.supabase("DELETE", table, resp.statusCode(), duration + "ms");
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase] DELETE " + table + " failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    // ==========================================
    // SUPABASE AUTH API (GoTrue)
    // ==========================================

    /**
     * Signs up a new user via Supabase Auth (/auth/v1/signup).
     * Attaches metadata including display name, phone, and role.
     */
    public SupabaseResponse signUp(String name, String email, String phone, String password, String role) {
        if (!configured) return new SupabaseResponse(503, "{\"error\":\"Supabase not configured\"}");
        String url = supabaseUrl + "/auth/v1/signup";

        String json = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\",\"data\":{\"name\":\"%s\",\"phone\":\"%s\",\"role\":\"%s\"}}",
                JsonUtils.escape(email),
                JsonUtils.escape(password),
                JsonUtils.escape(name),
                JsonUtils.escape(phone),
                JsonUtils.escape(role != null ? role : "GUEST")
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("apikey", anonKey.isEmpty() ? getEffectiveApiKey() : anonKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            AppLogger.info("[Supabase Auth] Sign up for " + email + " returned HTTP " + resp.statusCode());
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase Auth] Sign up failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    /**
     * Signs in an existing user with email and password via Supabase Auth (/auth/v1/token?grant_type=password).
     */
    public SupabaseResponse signIn(String email, String password) {
        if (!configured) return new SupabaseResponse(503, "{\"error\":\"Supabase not configured\"}");
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";

        String json = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\"}",
                JsonUtils.escape(email),
                JsonUtils.escape(password)
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("apikey", anonKey.isEmpty() ? getEffectiveApiKey() : anonKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            AppLogger.info("[Supabase Auth] Sign in for " + email + " returned HTTP " + resp.statusCode());
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase Auth] Sign in failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    /**
     * Verifies a user JWT token and retrieves profile metadata via Supabase Auth (/auth/v1/user).
     */
    public SupabaseResponse getUserFromToken(String jwtToken) {
        if (!configured || jwtToken == null || jwtToken.isEmpty()) {
            return new SupabaseResponse(401, "{\"error\":\"Invalid or missing token\"}");
        }
        String url = supabaseUrl + "/auth/v1/user";

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", anonKey.isEmpty() ? getEffectiveApiKey() : anonKey)
                    .header("Authorization", "Bearer " + jwtToken)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return new SupabaseResponse(resp.statusCode(), resp.body());
        } catch (Exception e) {
            AppLogger.error("[Supabase Auth] Token verification failed: " + e.getMessage());
            return new SupabaseResponse(500, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
        }
    }

    // ==========================================
    // AUDIT LOGGING IN SUPABASE
    // ==========================================

    /**
     * Persists a security or lifecycle audit record to the `audit_logs` table in Supabase.
     */
    public void logAudit(String action, String actorEmail, String actorRole, String targetResource, String details, String ip, String status) {
        if (!configured) return;
        String json = String.format(
                "{\"action\":\"%s\",\"actor_email\":\"%s\",\"actor_role\":\"%s\",\"target_resource\":\"%s\",\"details\":\"%s\",\"ip_address\":\"%s\",\"status\":\"%s\"}",
                JsonUtils.escape(action),
                JsonUtils.escape(actorEmail != null ? actorEmail : "anonymous"),
                JsonUtils.escape(actorRole != null ? actorRole : "ANON"),
                JsonUtils.escape(targetResource != null ? targetResource : ""),
                JsonUtils.escape(details != null ? details : ""),
                JsonUtils.escape(ip != null ? ip : "127.0.0.1"),
                JsonUtils.escape(status != null ? status : "SUCCESS")
        );

        // Fire and forget in background thread to avoid blocking client latency
        new Thread(() -> {
            try {
                insert("audit_logs", json);
            } catch (Exception ignored) {}
        }).start();
    }

    /**
     * Tests connectivity to Supabase.
     */
    public boolean testConnection() {
        if (!configured) return false;
        try {
            SupabaseResponse resp = get("rooms", "limit=1");
            return resp.statusCode == 200;
        } catch (Exception e) {
            return false;
        }
    }
}
