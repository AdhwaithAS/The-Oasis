package com.hotel.server;

import com.hotel.model.User;
import com.hotel.model.UserRole;

/**
 * Security context containing resolved authentication information and role for an incoming HTTP request.
 */
public class AuthContext {
    private final User user;
    private final UserRole role;
    private final String email;
    private final String token;
    private final boolean authenticated;
    private final String clientIp;

    public AuthContext(User user, UserRole role, String email, String token, boolean authenticated, String clientIp) {
        this.user = user;
        this.role = role != null ? role : UserRole.GUEST;
        this.email = email != null ? email : "";
        this.token = token != null ? token : "";
        this.authenticated = authenticated;
        this.clientIp = clientIp != null ? clientIp : "127.0.0.1";
    }

    public static AuthContext anonymous(String clientIp) {
        return new AuthContext(null, UserRole.GUEST, "", "", false, clientIp);
    }

    public User getUser() {
        return user;
    }

    public UserRole getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public String getToken() {
        return token;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public String getClientIp() {
        return clientIp;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean isStaffOrAdmin() {
        return role == UserRole.ADMIN || role == UserRole.STAFF;
    }

    public boolean isGuest() {
        return role == UserRole.GUEST;
    }
}
