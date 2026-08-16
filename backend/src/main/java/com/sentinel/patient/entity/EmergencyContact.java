package com.sentinel.patient.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "emergency_contacts", schema = "patient")
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String name;

    private String relationship;
    private String phone;
    private String alternatePhone;
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private Boolean isPrimary = false;

    @Column(nullable = false)
    private Boolean canMakeMedicalDecisions = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public EmergencyContact() {}

    public EmergencyContact(String name, String relationship, String phone) {
        this.name = name;
        this.relationship = relationship;
        this.phone = phone;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAlternatePhone() { return alternatePhone; }
    public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public Boolean getCanMakeMedicalDecisions() { return canMakeMedicalDecisions; }
    public void setCanMakeMedicalDecisions(Boolean canMakeMedicalDecisions) { this.canMakeMedicalDecisions = canMakeMedicalDecisions; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
