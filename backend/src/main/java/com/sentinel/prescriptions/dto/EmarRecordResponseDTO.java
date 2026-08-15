package com.sentinel.prescriptions.dto;

import java.time.LocalDateTime;

public class EmarRecordResponseDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private Long administeredById;
    private String administeredByName;
    private Long prescriptionId;
    private String medicationName;
    private String dose;
    private String route;
    private String status;
    private String notes;
    private LocalDateTime administeredAt;

    public EmarRecordResponseDTO() {}

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

    public Long getAdministeredById() {
        return administeredById;
    }

    public void setAdministeredById(Long administeredById) {
        this.administeredById = administeredById;
    }

    public String getAdministeredByName() {
        return administeredByName;
    }

    public void setAdministeredByName(String administeredByName) {
        this.administeredByName = administeredByName;
    }

    public Long getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Long prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getDose() {
        return dose;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getAdministeredAt() {
        return administeredAt;
    }

    public void setAdministeredAt(LocalDateTime administeredAt) {
        this.administeredAt = administeredAt;
    }
}
