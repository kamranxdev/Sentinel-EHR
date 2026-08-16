package com.sentinel.clinical.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AllergyResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID organizationId;
    private String allergenCode;
    private String allergenName;
    private String category;
    private String reaction;
    private String severity;
    private LocalDate onsetDate;
    private String status;
    private String verificationStatus;
    private String notes;
    private String recordedByUsername;
    private OffsetDateTime recordedAt;
    private OffsetDateTime updatedAt;

    public AllergyResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRecordedByUsername() { return recordedByUsername; }
    public void setRecordedByUsername(String recordedByUsername) { this.recordedByUsername = recordedByUsername; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
