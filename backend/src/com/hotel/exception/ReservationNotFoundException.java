package com.hotel.exception;

/**
 * Thrown when a reservation ID cannot be found in the system.
 */
public class ReservationNotFoundException extends HotelException {
    public ReservationNotFoundException(String message) {
        super(message, 404); // Not Found
    }
}
