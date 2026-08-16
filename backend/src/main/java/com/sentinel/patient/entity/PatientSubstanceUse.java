package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_substance_use", schema = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientSubstanceUse {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "substance_name", nullable = false, length = 255)
    private String substanceName;

    @Column(length = 30)
    private String status;

    @Column(length = 100)
    private String route;

    @Column(length = 100)
    private String frequency;

    @Column(length = 100)
    private String quantity;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PatientSubstanceUse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getSubstanceName() { return substanceName; }
    public void setSubstanceName(String substanceName) { this.substanceName = substanceName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
