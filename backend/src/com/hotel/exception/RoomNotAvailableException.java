package com.hotel.exception;

/**
 * Thrown when attempting to book an unavailable room or when capacity is exhausted.
 */
public class RoomNotAvailableException extends HotelException {
    public RoomNotAvailableException(String message) {
        super(message, 409); // Conflict
    }
}
