package com.sentinel.patient.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class DietaryHistoryResponseDTO {
    private UUID id;
    private UUID patientId;
    private String dietType;
    private String dietaryRestrictions;
    private String foodPreferences;
    private String nutritionalNotes;
    private OffsetDateTime recordedAt;

    public DietaryHistoryResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }
    public String getDietaryRestrictions() { return dietaryRestrictions; }
    public void setDietaryRestrictions(String dietaryRestrictions) { this.dietaryRestrictions = dietaryRestrictions; }
    public String getFoodPreferences() { return foodPreferences; }
    public void setFoodPreferences(String foodPreferences) { this.foodPreferences = foodPreferences; }
    public String getNutritionalNotes() { return nutritionalNotes; }
    public void setNutritionalNotes(String nutritionalNotes) { this.nutritionalNotes = nutritionalNotes; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
