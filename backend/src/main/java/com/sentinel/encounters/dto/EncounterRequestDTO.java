package com.sentinel.encounters.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EncounterRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long attendingProviderId;

    @NotBlank(message = "Encounter type is required")
    private String encounterType;

    private String chiefComplaint;
    private String clinicalNotes;
    private String dischargeSummary;
    private String status;
    private LocalDateTime encounterDate;

    public EncounterRequestDTO() {}

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

    public Long getAttendingProviderId() {
        return attendingProviderId;
    }

    public void setAttendingProviderId(Long attendingProviderId) {
        this.attendingProviderId = attendingProviderId;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getDischargeSummary() {
        return dischargeSummary;
    }

    public void setDischargeSummary(String dischargeSummary) {
        this.dischargeSummary = dischargeSummary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getEncounterDate() {
        return encounterDate;
    }

    public void setEncounterDate(LocalDateTime encounterDate) {
        this.encounterDate = encounterDate;
    }
}
