package com.hotel.model;

/**
 * Encapsulates authentication result containing User entity, JWT access token, and status message.
 */
public class AuthResult {
    private final User user;
    private final String token;
    private final String message;
    private final boolean supabaseAuth;

    public AuthResult(User user, String token, String message, boolean supabaseAuth) {
        this.user = user;
        this.token = token;
        this.message = message;
        this.supabaseAuth = supabaseAuth;
    }

    public User getUser() {
        return user;
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }

    public boolean isSupabaseAuth() {
        return supabaseAuth;
    }
}
