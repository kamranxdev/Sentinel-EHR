package com.sentinel.patient.dto;

import java.time.LocalDate;

public class UpdateSocialHistoryRequest {
    private String smokingStatus;
    private String smokingQuantity;
    private LocalDate smokingStartDate;
    private LocalDate smokingQuitDate;
    private String alcoholStatus;
    private String alcoholQuantity;
    private String alcoholFrequency;
    private String exerciseFrequency;
    private String exerciseDescription;
    private String occupation;
    private String livingSituation;
    private String notes;

    public UpdateSocialHistoryRequest() {}

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
}
