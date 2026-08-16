package com.sentinel.pharmacy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.identity.entity.User;
import com.sentinel.patient.entity.Patient;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication_reconciliation", schema = "pharmacy")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicationReconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @Column(name = "medication_name", nullable = false, length = 255)
    private String medicationName;

    @Column(length = 100)
    private String dose;

    @Column(length = 100)
    private String route;

    @Column(length = 100)
    private String frequency;

    @Column(length = 30)
    private String status;

    @Column(length = 100)
    private String source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciled_by")
    private User reconciledBy;

    @Column(nullable = false)
    private OffsetDateTime reconciledAt = OffsetDateTime.now();

    public MedicationReconciliation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }

    public String getDose() { return dose; }
    public void setDose(String dose) { this.dose = dose; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public User getReconciledBy() { return reconciledBy; }
    public void setReconciledBy(User reconciledBy) { this.reconciledBy = reconciledBy; }

    public OffsetDateTime getReconciledAt() { return reconciledAt; }
    public void setReconciledAt(OffsetDateTime reconciledAt) { this.reconciledAt = reconciledAt; }
}
