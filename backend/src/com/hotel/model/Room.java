package com.hotel.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Abstract base class representing a generic Hotel Room.
 * Demonstrates OOP Abstraction and serves as base for Inheritance.
 */
public abstract class Room {
    protected String roomNumber;
    protected String roomType; // "Standard" or "Suite"
    protected double basePricePerNight;
    protected int capacity;
    protected boolean isAvailable;
    protected String description;
    protected List<String> amenities;

    public Room(String roomNumber, String roomType, double basePricePerNight, int capacity, boolean isAvailable, String description) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.basePricePerNight = basePricePerNight;
        this.capacity = capacity;
        this.isAvailable = isAvailable;
        this.description = description;
        this.amenities = new ArrayList<>();
    }

    // Abstract methods demonstrating Polymorphism
    public abstract double calculateTotalRate(long numberOfNights);
    public abstract double getTaxRate();
    public abstract String getRoomCategoryDescription();
    public abstract List<String> getDefaultAmenities();

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public double getBasePricePerNight() {
        return basePricePerNight;
    }

    public void setBasePricePerNight(double basePricePerNight) {
        this.basePricePerNight = basePricePerNight;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getAmenities() {
        if (amenities == null || amenities.isEmpty()) {
            return getDefaultAmenities();
        }
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    /**
     * CSV row format: roomNumber,roomType,basePricePerNight,capacity,isAvailable,description
     */
    public String toCsvRow() {
        return String.format("%s,%s,%.2f,%d,%b,\"%s\"",
                roomNumber,
                roomType,
                basePricePerNight,
                capacity,
                isAvailable,
                description.replace("\"", "\"\""));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Room room = (Room) o;
        return Objects.equals(roomNumber, room.roomNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomNumber);
    }

    @Override
    public String toString() {
        return String.format("%s Room #%s ($%.2f/night, Cap: %d, Available: %b)",
                roomType, roomNumber, basePricePerNight, capacity, isAvailable);
    }
}
