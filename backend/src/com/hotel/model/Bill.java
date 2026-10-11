package com.hotel.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Bill class for calculating charges and generating formatted receipts.
 * Satisfies Section 4.5 and 8 of the Project Report.
 */
public class Bill {
    private String billId;
    private String reservationId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String roomNumber;
    private String roomType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private long numberOfNights;
    private double ratePerNight;
    private double subtotal;
    private double taxRate;
    private double taxAmount;
    private double totalAmount;
    private String paymentStatus;
    private LocalDateTime generatedAt;

    public Bill(Reservation reservation) {
        if (reservation == null) {
            throw new IllegalArgumentException("Reservation cannot be null for bill generation");
        }
        this.billId = "BILL-" + reservation.getReservationId().replace("RES-", "");
        this.reservationId = reservation.getReservationId();
        
        Customer c = reservation.getCustomer();
        this.customerName = c != null ? c.getName() : "Guest";
        this.customerEmail = c != null ? c.getEmail() : "";
        this.customerPhone = c != null ? c.getPhone() : "";

        Room r = reservation.getRoom();
        this.roomNumber = r != null ? r.getRoomNumber() : "N/A";
        this.roomType = r != null ? r.getRoomType() : "Standard";
        this.ratePerNight = r != null ? r.getBasePricePerNight() : 0.0;
        
        this.checkInDate = reservation.getCheckInDate();
        this.checkOutDate = reservation.getCheckOutDate();
        this.numberOfNights = reservation.getNumberOfNights();

        // Polymorphic cost calculation via room
        if (r != null) {
            this.subtotal = r.calculateTotalRate(this.numberOfNights);
            this.taxRate = r.getTaxRate();
            this.taxAmount = Math.round(this.subtotal * this.taxRate * 100.0) / 100.0;
            this.totalAmount = Math.round((this.subtotal + this.taxAmount) * 100.0) / 100.0;
        } else {
            this.subtotal = reservation.getTotalAmount();
            this.taxRate = 0.10;
            this.taxAmount = 0.0;
            this.totalAmount = reservation.getTotalAmount();
        }

        this.paymentStatus = reservation.getStatus() == ReservationStatus.CHECKED_OUT ? "PAID" : "DUE";
        this.generatedAt = LocalDateTime.now();
    }

    public String getFormattedBill() {
        DateTimeFormatter df = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        DateTimeFormatter tf = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss");

        StringBuilder sb = new StringBuilder();
        sb.append("============================================================\n");
        sb.append("                HOTEL RESERVATION SYSTEM                   \n");
        sb.append("                    INVOICE & RECEIPT                      \n");
        sb.append("============================================================\n");
        sb.append(String.format(" Invoice Number : %-20s Date: %s\n", billId, generatedAt.format(tf)));
        sb.append(String.format(" Reservation ID : %-20s Status: %s\n", reservationId, paymentStatus));
        sb.append("------------------------------------------------------------\n");
        sb.append(" GUEST INFORMATION:\n");
        sb.append(String.format(" Name  : %s\n", customerName));
        sb.append(String.format(" Email : %s\n", customerEmail));
        sb.append(String.format(" Phone : %s\n", customerPhone));
        sb.append("------------------------------------------------------------\n");
        sb.append(" STAY DETAILS:\n");
        sb.append(String.format(" Room Number  : Room %s (%s Room)\n", roomNumber, roomType));
        sb.append(String.format(" Check-in     : %s\n", checkInDate.format(df)));
        sb.append(String.format(" Check-out    : %s\n", checkOutDate.format(df)));
        sb.append(String.format(" Duration     : %d Night(s)\n", numberOfNights));
        sb.append("------------------------------------------------------------\n");
        sb.append(" ITEMIZED CHARGES:\n");
        sb.append(String.format(" Room Rate (%d nights @ ₹%.2f/night) : ₹%.2f\n", numberOfNights, ratePerNight, subtotal));
        sb.append(String.format(" Hospitality Tax & Surcharge (%.0f%%) : ₹%.2f\n", taxRate * 100, taxAmount));
        sb.append("------------------------------------------------------------\n");
        sb.append(String.format(" TOTAL AMOUNT PAYABLE                : ₹%.2f\n", totalAmount));
        sb.append("============================================================\n");
        sb.append("             Thank you for choosing to stay with us!         \n");
        sb.append("============================================================\n");
        return sb.toString();
    }

    public String getBillId() {
        return billId;
    }

    public String getReservationId() {
        return reservationId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public long getNumberOfNights() {
        return numberOfNights;
    }

    public double getRatePerNight() {
        return ratePerNight;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public double getTaxRate() {
        return taxRate;
    }

    public double getTaxAmount() {
        return taxAmount;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
}
