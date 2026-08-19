package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TriageResponseDTO {
    private UUID id;
    private UUID patientId;
    private String chiefComplaint;
    private String triagePriority;
    private String vitalsSummary;
    private String notes;
    private String recordedByEmail;
    private OffsetDateTime recordedAt;

    public TriageResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getTriagePriority() { return triagePriority; }
    public void setTriagePriority(String triagePriority) { this.triagePriority = triagePriority; }
    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRecordedByEmail() { return recordedByEmail; }
    public void setRecordedByEmail(String recordedByEmail) { this.recordedByEmail = recordedByEmail; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
