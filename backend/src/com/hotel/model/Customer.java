package com.hotel.model;

import java.util.Objects;

/**
 * Customer class representing hotel guests.
 * Demonstrates OOP Encapsulation with private attributes and accessor methods.
 */
public class Customer {
    private String id;
    private String name;
    private String email;
    private String phone;

    public Customer() {
    }

    public Customer(String id, String name, String email, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    /**
     * CSV row representation: id,name,email,phone
     */
    public String toCsvRow() {
        return String.format("%s,\"%s\",\"%s\",\"%s\"",
                id,
                name.replace("\"", "\"\""),
                email.replace("\"", "\"\""),
                phone.replace("\"", "\"\""));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Customer customer = (Customer) o;
        return Objects.equals(id, customer.id) || Objects.equals(email, customer.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
