package com.hotel.model;

import java.util.Arrays;
import java.util.List;

/**
 * Standard Room class inheriting from Room.
 * Demonstrates OOP Inheritance and Polymorphic implementation of pricing and amenities.
 */
public class StandardRoom extends Room {
    private static final double STANDARD_RATE = 110.00;
    private static final int STANDARD_CAPACITY = 2;
    private static final double STANDARD_TAX_RATE = 0.10; // 10% tax

    public StandardRoom(String roomNumber) {
        super(roomNumber, "Standard", STANDARD_RATE, STANDARD_CAPACITY, true,
                "Well-appointed comfortable room featuring high-speed Wi-Fi, queen bed, work desk, and en-suite bath.");
    }

    public StandardRoom(String roomNumber, double basePricePerNight, int capacity, boolean isAvailable, String description) {
        super(roomNumber, "Standard", basePricePerNight, capacity, isAvailable, description);
    }

    @Override
    public double calculateTotalRate(long numberOfNights) {
        long nights = Math.max(1, numberOfNights);
        return basePricePerNight * nights;
    }

    @Override
    public double getTaxRate() {
        return STANDARD_TAX_RATE;
    }

    @Override
    public String getRoomCategoryDescription() {
        return "Standard Hotel Room - Designed for solo travelers, business professionals, and couples.";
    }

    @Override
    public List<String> getDefaultAmenities() {
        return Arrays.asList(
                "Queen Size Comfort Bed",
                "High-Speed Fiber Wi-Fi",
                "43\" 4K Smart Cable TV",
                "Climate-Controlled Air Conditioning",
                "Work Desk & Ergonomic Chair",
                "Coffee & Tea Maker",
                "Private Bath & Toiletries"
        );
    }
}
