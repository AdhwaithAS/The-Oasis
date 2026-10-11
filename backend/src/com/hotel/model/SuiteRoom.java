package com.hotel.model;

import java.util.Arrays;
import java.util.List;

/**
 * Suite Room class inheriting from Room.
 * Demonstrates OOP Inheritance and Polymorphic customization with luxury perks and tailored pricing.
 */
public class SuiteRoom extends Room {
    private static final double SUITE_RATE = 240.00;
    private static final int SUITE_CAPACITY = 4;
    private static final double SUITE_TAX_RATE = 0.14; // 14% luxury tax
    private double luxuryServiceFee = 25.00; // Flat fee per stay or per night included

    public SuiteRoom(String roomNumber) {
        super(roomNumber, "Suite", SUITE_RATE, SUITE_CAPACITY, true,
                "Opulent executive suite with separate master living area, marble jacuzzi, panoramic city view, and complimentary minibar.");
    }

    public SuiteRoom(String roomNumber, double basePricePerNight, int capacity, boolean isAvailable, String description) {
        super(roomNumber, "Suite", basePricePerNight, capacity, isAvailable, description);
    }

    public SuiteRoom(String roomNumber, double basePricePerNight, int capacity, boolean isAvailable, String description, double luxuryServiceFee) {
        super(roomNumber, "Suite", basePricePerNight, capacity, isAvailable, description);
        this.luxuryServiceFee = luxuryServiceFee;
    }

    public double getLuxuryServiceFee() {
        return luxuryServiceFee;
    }

    public void setLuxuryServiceFee(double luxuryServiceFee) {
        this.luxuryServiceFee = luxuryServiceFee;
    }

    @Override
    public double calculateTotalRate(long numberOfNights) {
        long nights = Math.max(1, numberOfNights);
        // Base rate plus luxury service package
        return (basePricePerNight * nights) + (luxuryServiceFee * nights);
    }

    @Override
    public double getTaxRate() {
        return SUITE_TAX_RATE;
    }

    @Override
    public String getRoomCategoryDescription() {
        return "Executive Luxury Suite - Premium stay with dedicated butler service, complimentary breakfast buffet, and jacuzzi.";
    }

    @Override
    public List<String> getDefaultAmenities() {
        return Arrays.asList(
                "King Size Pillow-Top Bed + Sofa Bed",
                "Private Marble Jacuzzi Spa",
                "Panoramic Balcony & Lounge View",
                "Complimentary Gourmet Breakfast",
                "Stocked Premium Mini-Bar",
                "65\" OLED TV with Surround Sound",
                "Dedicated 24/7 Concierge & Butler Service",
                "Nespresso Espresso Machine"
        );
    }
}
