package com.sentinel.encounters.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "beds")
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bedCode; // e.g. WARD-A-101-B1

    @Column(nullable = false)
    private String facilityName = "Sentinel General Hospital";

    @Column(nullable = false)
    private String departmentName; // e.g. CARDIOLOGY, ICU, EMERGENCY

    @Column(nullable = false)
    private String wardName; // e.g. Ward A, ICU Unit 1

    @Column(nullable = false)
    private String roomNumber; // e.g. Room 101

    @Column(nullable = false)
    private String bedNumber; // e.g. Bed 1

    @Column(nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, CLEANING_REQUIRED

    private String features; // Telemetry, Negative Pressure, Bariatric, Pediatric

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_encounter_id")
    private Encounter currentEncounter;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Bed() {}

    public Bed(String bedCode, String departmentName, String wardName, String roomNumber, String bedNumber, String features) {
        this.bedCode = bedCode;
        this.departmentName = departmentName;
        this.wardName = wardName;
        this.roomNumber = roomNumber;
        this.bedNumber = bedNumber;
        this.features = features;
        this.status = "AVAILABLE";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBedCode() {
        return bedCode;
    }

    public void setBedCode(String bedCode) {
        this.bedCode = bedCode;
    }

    public String getFacilityName() {
        return facilityName;
    }

    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getWardName() {
        return wardName;
    }

    public void setWardName(String wardName) {
        this.wardName = wardName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public Encounter getCurrentEncounter() {
        return currentEncounter;
    }

    public void setCurrentEncounter(Encounter currentEncounter) {
        this.currentEncounter = currentEncounter;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
