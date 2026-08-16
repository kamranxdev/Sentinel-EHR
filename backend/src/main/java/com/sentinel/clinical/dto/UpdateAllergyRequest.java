package com.sentinel.clinical.dto;

import java.time.LocalDate;

public class UpdateAllergyRequest {
    private String allergenName;
    private String category;
    private String reaction;
    private String severity;
    private LocalDate onsetDate;
    private String status;
    private String verificationStatus;
    private String notes;

    public UpdateAllergyRequest() {}

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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
