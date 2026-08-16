package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_observations", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClinicalObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;

    @Column(nullable = false, length = 100)
    private String observationCode;

    private String observationName;
    private String valueString;
    private String valueUnit;
    private String status = "FINAL";

    @Column(nullable = false)
    private OffsetDateTime observedAt = OffsetDateTime.now();

    public ClinicalObservation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public User getRecordedBy() { return recordedBy; }
    public void setRecordedBy(User recordedBy) { this.recordedBy = recordedBy; }

    public String getObservationCode() { return observationCode; }
    public void setObservationCode(String observationCode) { this.observationCode = observationCode; }

    public String getObservationName() { return observationName; }
    public void setObservationName(String observationName) { this.observationName = observationName; }

    public String getValueString() { return valueString; }
    public void setValueString(String valueString) { this.valueString = valueString; }

    public String getValueUnit() { return valueUnit; }
    public void setValueUnit(String valueUnit) { this.valueUnit = valueUnit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getObservedAt() { return observedAt; }
    public void setObservedAt(OffsetDateTime observedAt) { this.observedAt = observedAt; }
}
