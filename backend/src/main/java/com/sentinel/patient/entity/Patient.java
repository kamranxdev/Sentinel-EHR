package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.Person;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients", schema = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "person_id", nullable = false, unique = true)
    private Person person;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    private OffsetDateTime deceasedAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Transient or mapped helper fields for legacy compatibility
    @Transient
    private String patientCode; // MRN

    @Transient
    private Organization organization;

    public Patient() {}

    public Patient(Person person) {
        this.person = person;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Person getPerson() { return person; }
    public void setPerson(Person person) { this.person = person; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getDeceasedAt() { return deceasedAt; }
    public void setDeceasedAt(OffsetDateTime deceasedAt) { this.deceasedAt = deceasedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper getters for backward compatibility with DTOs and Controllers
    public String getFullName() {
        return person != null ? person.getFullName() : "";
    }

    public LocalDate getDateOfBirth() {
        return person != null ? person.getDateOfBirth() : null;
    }

    public String getGender() {
        return person != null ? person.getSexAtBirth() : null;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }
}
