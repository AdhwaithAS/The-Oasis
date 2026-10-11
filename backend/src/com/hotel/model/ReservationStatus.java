package com.hotel.model;

/**
 * Status enumeration for tracking reservation lifecycle.
 */
public enum ReservationStatus {
    BOOKED,
    CHECKED_IN,
    CHECKED_OUT,
    CANCELLED;

    public static ReservationStatus fromString(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return BOOKED;
        }
        try {
            return ReservationStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return BOOKED;
        }
    }
}
