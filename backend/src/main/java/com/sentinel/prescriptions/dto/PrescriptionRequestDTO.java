package com.sentinel.prescriptions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PrescriptionRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long doctorId;

    @NotBlank(message = "Medication name is required")
    private String medicationName;

    private String rxNormCode;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    private String route;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    private Integer durationDays;
    private Integer refills;
    private String instructions;
    private String status;

    /**
     * When true, the clinician explicitly acknowledges and overrides a drug-allergy
     * or contraindication warning flagged by the safety-check engine.
     */
    private Boolean overrideWarning = false;

    public PrescriptionRequestDTO() {}

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

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getRxNormCode() {
        return rxNormCode;
    }

    public void setRxNormCode(String rxNormCode) {
        this.rxNormCode = rxNormCode;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getRefills() {
        return refills;
    }

    public void setRefills(Integer refills) {
        this.refills = refills;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getOverrideWarning() {
        return overrideWarning;
    }

    public void setOverrideWarning(Boolean overrideWarning) {
        this.overrideWarning = overrideWarning;
    }
}
