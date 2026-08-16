package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "patient_family_history", schema = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientFamilyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 100)
    private String relationship;

    @Column(name = "condition_code", length = 100)
    private String conditionCode;

    @Column(name = "condition_name", nullable = false, length = 255)
    private String conditionName;

    @Column(name = "age_at_onset")
    private Integer ageAtOnset;

    private Boolean deceased;

    @Column(name = "cause_of_death", columnDefinition = "TEXT")
    private String causeOfDeath;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PatientFamilyHistory() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getConditionCode() { return conditionCode; }
    public void setConditionCode(String conditionCode) { this.conditionCode = conditionCode; }

    public String getConditionName() { return conditionName; }
    public void setConditionName(String conditionName) { this.conditionName = conditionName; }

    public Integer getAgeAtOnset() { return ageAtOnset; }
    public void setAgeAtOnset(Integer ageAtOnset) { this.ageAtOnset = ageAtOnset; }

    public Boolean getDeceased() { return deceased; }
    public void setDeceased(Boolean deceased) { this.deceased = deceased; }

    public String getCauseOfDeath() { return causeOfDeath; }
    public void setCauseOfDeath(String causeOfDeath) { this.causeOfDeath = causeOfDeath; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
