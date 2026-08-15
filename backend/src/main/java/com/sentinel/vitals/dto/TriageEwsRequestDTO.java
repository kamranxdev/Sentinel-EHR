package com.sentinel.vitals.dto;

import jakarta.validation.constraints.NotNull;

public class TriageEwsRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String chiefComplaint;
    private String triagePriority;
    private String vitalsSummary;
    private String notes;

    public TriageEwsRequestDTO() {}

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public void setPatient(java.util.Map<String, Object> patientMap) {
        if (patientMap != null && patientMap.containsKey("id")) {
            Object idObj = patientMap.get("id");
            if (idObj instanceof Number) {
                this.patientId = ((Number) idObj).longValue();
            }
        }
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getTriagePriority() {
        return triagePriority;
    }

    public void setTriagePriority(String triagePriority) {
        this.triagePriority = triagePriority;
    }

    public String getVitalsSummary() {
        return vitalsSummary;
    }

    public void setVitalsSummary(String vitalsSummary) {
        this.vitalsSummary = vitalsSummary;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
