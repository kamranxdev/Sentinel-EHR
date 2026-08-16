package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "patient_social_history", schema = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientSocialHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "smoking_status", length = 30)
    private String smokingStatus;

    @Column(name = "smoking_quantity", length = 100)
    private String smokingQuantity;

    @Column(name = "smoking_start_date")
    private LocalDate smokingStartDate;

    @Column(name = "smoking_quit_date")
    private LocalDate smokingQuitDate;

    @Column(name = "alcohol_status", length = 30)
    private String alcoholStatus;

    @Column(name = "alcohol_quantity", length = 100)
    private String alcoholQuantity;

    @Column(name = "alcohol_frequency", length = 100)
    private String alcoholFrequency;

    @Column(name = "exercise_frequency", length = 100)
    private String exerciseFrequency;

    @Column(name = "exercise_description", columnDefinition = "TEXT")
    private String exerciseDescription;

    @Column(length = 255)
    private String occupation;

    @Column(name = "living_situation", columnDefinition = "TEXT")
    private String livingSituation;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private OffsetDateTime recordedAt = OffsetDateTime.now();

    public PatientSocialHistory() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getSmokingStatus() { return smokingStatus; }
    public void setSmokingStatus(String smokingStatus) { this.smokingStatus = smokingStatus; }

    public String getSmokingQuantity() { return smokingQuantity; }
    public void setSmokingQuantity(String smokingQuantity) { this.smokingQuantity = smokingQuantity; }

    public LocalDate getSmokingStartDate() { return smokingStartDate; }
    public void setSmokingStartDate(LocalDate smokingStartDate) { this.smokingStartDate = smokingStartDate; }

    public LocalDate getSmokingQuitDate() { return smokingQuitDate; }
    public void setSmokingQuitDate(LocalDate smokingQuitDate) { this.smokingQuitDate = smokingQuitDate; }

    public String getAlcoholStatus() { return alcoholStatus; }
    public void setAlcoholStatus(String alcoholStatus) { this.alcoholStatus = alcoholStatus; }

    public String getAlcoholQuantity() { return alcoholQuantity; }
    public void setAlcoholQuantity(String alcoholQuantity) { this.alcoholQuantity = alcoholQuantity; }

    public String getAlcoholFrequency() { return alcoholFrequency; }
    public void setAlcoholFrequency(String alcoholFrequency) { this.alcoholFrequency = alcoholFrequency; }

    public String getExerciseFrequency() { return exerciseFrequency; }
    public void setExerciseFrequency(String exerciseFrequency) { this.exerciseFrequency = exerciseFrequency; }

    public String getExerciseDescription() { return exerciseDescription; }
    public void setExerciseDescription(String exerciseDescription) { this.exerciseDescription = exerciseDescription; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getLivingSituation() { return livingSituation; }
    public void setLivingSituation(String livingSituation) { this.livingSituation = livingSituation; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
