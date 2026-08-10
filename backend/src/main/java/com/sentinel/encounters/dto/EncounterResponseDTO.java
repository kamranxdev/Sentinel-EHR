package com.sentinel.encounters.dto;

import java.time.LocalDateTime;

public class EncounterResponseDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private Long attendingProviderId;
    private String attendingProviderName;
    private String encounterType;
    private String chiefComplaint;
    private String clinicalNotes;
    private String dischargeSummary;
    private String status;
    private LocalDateTime encounterDate;

    public EncounterResponseDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public Long getAttendingProviderId() {
        return attendingProviderId;
    }

    public void setAttendingProviderId(Long attendingProviderId) {
        this.attendingProviderId = attendingProviderId;
    }

    public String getAttendingProviderName() {
        return attendingProviderName;
    }

    public void setAttendingProviderName(String attendingProviderName) {
        this.attendingProviderName = attendingProviderName;
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
