package com.hotel.model;

/**
 * User roles for Role-Based Access Control (RBAC).
 * Implements Section 13 (Admin login and role-based access).
 */
public enum UserRole {
    ADMIN,
    STAFF,
    GUEST;

    public static UserRole fromString(String roleStr) {
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return GUEST;
        }
        try {
            return UserRole.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return GUEST;
        }
    }
}
