package com.hotel.util;

import com.hotel.exception.ValidationException;

import java.time.LocalDate;
import java.util.regex.Pattern;

/**
 * Validation utility class enforcing business rules and sanitization.
 * Implements Section 4.6 and Section 8 (Validation class) of the Project Report.
 */
public class Validation {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[+]?[0-9\\s\\-().]{7,20}$");

    private Validation() {
        // Utility class with static methods
    }

    /**
     * Validates guest customer details.
     */
    public static void validateCustomer(String name, String email, String phone) throws ValidationException {
        if (name == null || name.trim().length() < 2) {
            throw new ValidationException("Customer name is required and must be at least 2 characters.");
        }
        validateEmail(email);
        validatePhone(phone);
    }

    /**
     * Validates email address format.
     */
    public static void validateEmail(String email) throws ValidationException {
        if (email == null || email.trim().isEmpty()) {
            throw new ValidationException("Email address is required.");
        }
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new ValidationException("Invalid email format (e.g., guest@example.com).");
        }
    }

    /**
     * Validates phone number format.
     */
    public static void validatePhone(String phone) throws ValidationException {
        if (phone == null || phone.trim().isEmpty()) {
            throw new ValidationException("Phone number is required.");
        }
        String cleanPhone = phone.replaceAll("[\\s\\-().]", "");
        if (cleanPhone.length() < 7 || cleanPhone.length() > 15 || !PHONE_PATTERN.matcher(phone.trim()).matches()) {
            throw new ValidationException("Invalid phone number. Must contain 7 to 15 digits.");
        }
    }

    /**
     * Validates check-in and check-out dates.
     */
    public static void validateDates(LocalDate checkIn, LocalDate checkOut) throws ValidationException {
        if (checkIn == null) {
            throw new ValidationException("Check-in date is required.");
        }
        if (checkOut == null) {
            throw new ValidationException("Check-out date is required.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new ValidationException("Check-out date must be strictly after the check-in date.");
        }
    }

    /**
     * Validates room type selection.
     */
    public static void validateRoomType(String roomType) throws ValidationException {
        if (roomType == null || roomType.trim().isEmpty()) {
            throw new ValidationException("Room type is required.");
        }
        String normalized = roomType.trim();
        if (!normalized.equalsIgnoreCase("Standard") && !normalized.equalsIgnoreCase("Suite")) {
            throw new ValidationException("Invalid room type. Must be either 'Standard' or 'Suite'.");
        }
    }

    /**
     * Validates Reservation ID format.
     */
    public static void validateReservationId(String reservationId) throws ValidationException {
        if (reservationId == null || reservationId.trim().isEmpty()) {
            throw new ValidationException("Reservation ID is required.");
        }
    }
}
