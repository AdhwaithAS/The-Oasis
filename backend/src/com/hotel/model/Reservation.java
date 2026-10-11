package com.hotel.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Reservation class encapsulating booking details.
 * Connects Customer and Room entities.
 */
public class Reservation {
    private String reservationId;
    private Customer customer;
    private Room room;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private ReservationStatus status;
    private double totalAmount;
    private LocalDateTime createdAt;
    private String specialRequests;

    public Reservation(String reservationId, Customer customer, Room room, LocalDate checkInDate, LocalDate checkOutDate) {
        this.reservationId = reservationId;
        this.customer = customer;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = ReservationStatus.BOOKED;
        this.createdAt = LocalDateTime.now();
        this.specialRequests = "";
        this.totalAmount = recalculateTotalAmount();
    }

    public Reservation(String reservationId, Customer customer, Room room, LocalDate checkInDate,
                       LocalDate checkOutDate, ReservationStatus status, double totalAmount,
                       LocalDateTime createdAt, String specialRequests) {
        this.reservationId = reservationId;
        this.customer = customer;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = status;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.specialRequests = specialRequests != null ? specialRequests : "";
    }

    public long getNumberOfNights() {
        if (checkInDate == null || checkOutDate == null) return 1;
        long days = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        return Math.max(1, days);
    }

    public double recalculateTotalAmount() {
        if (room == null) return 0.0;
        long nights = getNumberOfNights();
        double baseSubtotal = room.calculateTotalRate(nights);
        double tax = baseSubtotal * room.getTaxRate();
        this.totalAmount = Math.round((baseSubtotal + tax) * 100.0) / 100.0;
        return this.totalAmount;
    }

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
        recalculateTotalAmount();
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
        recalculateTotalAmount();
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
        recalculateTotalAmount();
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    /**
     * CSV row format:
     * reservationId,customerId,roomNumber,checkInDate,checkOutDate,status,totalAmount,createdAt,specialRequests
     */
    public String toCsvRow() {
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE;
        DateTimeFormatter ldtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return String.format("%s,%s,%s,%s,%s,%s,%.2f,%s,\"%s\"",
                reservationId,
                customer != null ? customer.getId() : "",
                room != null ? room.getRoomNumber() : "",
                checkInDate.format(dtf),
                checkOutDate.format(dtf),
                status.name(),
                totalAmount,
                createdAt != null ? createdAt.format(ldtf) : LocalDateTime.now().format(ldtf),
                specialRequests != null ? specialRequests.replace("\"", "\"\"") : "");
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "id='" + reservationId + '\'' +
                ", guest=" + (customer != null ? customer.getName() : "N/A") +
                ", room=" + (room != null ? room.getRoomNumber() : "N/A") +
                ", dates=" + checkInDate + " -> " + checkOutDate +
                ", status=" + status +
                ", total=$" + totalAmount +
                '}';
    }
}
