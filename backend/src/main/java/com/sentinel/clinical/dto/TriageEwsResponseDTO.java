package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TriageEwsResponseDTO {

    private UUID id;
    private UUID patientId;
    private String patientName;
    private String patientCode;
    private UUID recordedById;
    private String recordedByName;
    private String chiefComplaint;
    private String triagePriority;
    private String vitalsSummary;
    private String notes;
    private OffsetDateTime recordedAt;

    public TriageEwsResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public UUID getRecordedById() { return recordedById; }
    public void setRecordedById(UUID recordedById) { this.recordedById = recordedById; }

    public String getRecordedByName() { return recordedByName; }
    public void setRecordedByName(String recordedByName) { this.recordedByName = recordedByName; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public String getTriagePriority() { return triagePriority; }
    public void setTriagePriority(String triagePriority) { this.triagePriority = triagePriority; }

    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
