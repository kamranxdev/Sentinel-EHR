package com.sentinel.clinical.dto;

import java.time.LocalDate;

public class AddAllergyRequest {
    private String allergenCode;
    private String allergenName;
    private String category;
    private String reaction;
    private String severity;
    private LocalDate onsetDate;
    private String notes;

    public AddAllergyRequest() {}

    public String getAllergenCode() { return allergenCode; }
    public void setAllergenCode(String allergenCode) { this.allergenCode = allergenCode; }
    public String getAllergenName() { return allergenName; }
    public void setAllergenName(String allergenName) { this.allergenName = allergenName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getReaction() { return reaction; }
    public void setReaction(String reaction) { this.reaction = reaction; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public LocalDate getOnsetDate() { return onsetDate; }
    public void setOnsetDate(LocalDate onsetDate) { this.onsetDate = onsetDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
