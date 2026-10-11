package com.hotel.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * User entity representing registered system users with roles.
 */
public class User {
    private String id;
    private String name;
    private String email;
    private String password; // In production this would be bcrypt/argon2
    private String phone;
    private UserRole role;
    private LocalDateTime createdAt;

    public User() {
    }

    public User(String id, String name, String email, String password, String phone, UserRole role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role != null ? role : UserRole.GUEST;
        this.createdAt = LocalDateTime.now();
    }

    public User(String id, String name, String email, String password, String phone, UserRole role, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role != null ? role : UserRole.GUEST;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String toCsvRow() {
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return String.format("%s,\"%s\",\"%s\",\"%s\",\"%s\",%s,%s",
                id,
                name.replace("\"", "\"\""),
                email.replace("\"", "\"\""),
                password.replace("\"", "\"\""),
                phone.replace("\"", "\"\""),
                role.name(),
                createdAt != null ? createdAt.format(dtf) : LocalDateTime.now().format(dtf));
    }
}
