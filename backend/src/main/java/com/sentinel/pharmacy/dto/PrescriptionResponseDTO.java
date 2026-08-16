package com.sentinel.pharmacy.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PrescriptionResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private String medicationName;
    private String rxNormCode;
    private String dosage;
    private String route;
    private String frequency;
    private Integer durationDays;
    private String status;
    private String indication;
    private String instructions;
    private Integer refills;
    private String doctorUsername;
    private OffsetDateTime prescribedAt;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public PrescriptionResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public String getRxNormCode() { return rxNormCode; }
    public void setRxNormCode(String rxNormCode) { this.rxNormCode = rxNormCode; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getIndication() { return indication; }
    public void setIndication(String indication) { this.indication = indication; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public Integer getRefills() { return refills; }
    public void setRefills(Integer refills) { this.refills = refills; }
    public String getDoctorUsername() { return doctorUsername; }
    public void setDoctorUsername(String doctorUsername) { this.doctorUsername = doctorUsername; }
    public OffsetDateTime getPrescribedAt() { return prescribedAt; }
    public void setPrescribedAt(OffsetDateTime prescribedAt) { this.prescribedAt = prescribedAt; }
    public OffsetDateTime getStartAt() { return startAt; }
    public void setStartAt(OffsetDateTime startAt) { this.startAt = startAt; }
    public OffsetDateTime getEndAt() { return endAt; }
    public void setEndAt(OffsetDateTime endAt) { this.endAt = endAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
