package com.sentinel.clinical.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class TriageEwsRequestDTO {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private String chiefComplaint;
    private String triagePriority;
    private String vitalsSummary;
    private String notes;

    public TriageEwsRequestDTO() {}

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
}
