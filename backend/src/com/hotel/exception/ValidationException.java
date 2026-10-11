package com.hotel.exception;

/**
 * Thrown when user input validation fails (e.g., invalid email, invalid phone, inverted dates).
 */
public class ValidationException extends HotelException {
    public ValidationException(String message) {
        super(message, 400);
    }
}
