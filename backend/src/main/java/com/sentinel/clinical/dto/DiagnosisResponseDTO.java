package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class DiagnosisResponseDTO {
    private UUID id;
    private UUID patientId;
    private String conditionName;
    private String icdCode;
    private String snomedCode;
    private String status;
    private OffsetDateTime onsetDate;
    private String notes;
    private String doctorUsername;
    private OffsetDateTime recordedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public DiagnosisResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getConditionName() { return conditionName; }
    public void setConditionName(String conditionName) { this.conditionName = conditionName; }
    public String getIcdCode() { return icdCode; }
    public void setIcdCode(String icdCode) { this.icdCode = icdCode; }
    public String getSnomedCode() { return snomedCode; }
    public void setSnomedCode(String snomedCode) { this.snomedCode = snomedCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getOnsetDate() { return onsetDate; }
    public void setOnsetDate(OffsetDateTime onsetDate) { this.onsetDate = onsetDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getDoctorUsername() { return doctorUsername; }
    public void setDoctorUsername(String doctorUsername) { this.doctorUsername = doctorUsername; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
