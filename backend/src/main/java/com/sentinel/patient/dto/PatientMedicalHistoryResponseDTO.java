package com.sentinel.patient.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PatientMedicalHistoryResponseDTO {
    private UUID id;
    private UUID patientId;
    private String pastMedicalHistory;
    private String pastSurgicalHistory;
    private String familyHistory;
    private String socialHistory;
    private OffsetDateTime updatedAt;

    public PatientMedicalHistoryResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getPastMedicalHistory() { return pastMedicalHistory; }
    public void setPastMedicalHistory(String pastMedicalHistory) { this.pastMedicalHistory = pastMedicalHistory; }
    public String getPastSurgicalHistory() { return pastSurgicalHistory; }
    public void setPastSurgicalHistory(String pastSurgicalHistory) { this.pastSurgicalHistory = pastSurgicalHistory; }
    public String getFamilyHistory() { return familyHistory; }
    public void setFamilyHistory(String familyHistory) { this.familyHistory = familyHistory; }
    public String getSocialHistory() { return socialHistory; }
    public void setSocialHistory(String socialHistory) { this.socialHistory = socialHistory; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
