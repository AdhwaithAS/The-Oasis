package com.hotel.exception;

/**
 * Base custom exception for all hotel domain errors.
 * Demonstrates Java Exception Handling hierarchy.
 */
public class HotelException extends Exception {
    private final int statusCode;

    public HotelException(String message) {
        super(message);
        this.statusCode = 400;
    }

    public HotelException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public HotelException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
