package com.sentinel.nursing.dto;

import java.time.LocalDateTime;

public class TriageEwsResponseDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private Long recordedById;
    private String recordedByName;
    private String chiefComplaint;
    private String triagePriority;
    private String vitalsSummary;
    private String notes;
    private LocalDateTime recordedAt;

    public TriageEwsResponseDTO() {}

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

    public Long getRecordedById() {
        return recordedById;
    }

    public void setRecordedById(Long recordedById) {
        this.recordedById = recordedById;
    }

    public String getRecordedByName() {
        return recordedByName;
    }

    public void setRecordedByName(String recordedByName) {
        this.recordedByName = recordedByName;
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

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
