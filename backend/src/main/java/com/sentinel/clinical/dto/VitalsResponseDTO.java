package com.sentinel.clinical.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class VitalsResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private BigDecimal systolicBp;
    private BigDecimal diastolicBp;
    private BigDecimal meanArterialPressure;
    private BigDecimal heartRate;
    private BigDecimal respiratoryRate;
    private BigDecimal temperature;
    private String temperatureUnit;
    private BigDecimal oxygenSaturation;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private BigDecimal bmi;
    private BigDecimal bloodGlucose;
    private String glucoseUnit;
    private BigDecimal painScore;
    private String position;
    private String oxygenDeliveryMethod;
    private String notes;
    private String recordedByUsername;
    private OffsetDateTime recordedAt;

    public VitalsResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public BigDecimal getSystolicBp() { return systolicBp; }
    public void setSystolicBp(BigDecimal systolicBp) { this.systolicBp = systolicBp; }
    public BigDecimal getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(BigDecimal diastolicBp) { this.diastolicBp = diastolicBp; }
    public BigDecimal getMeanArterialPressure() { return meanArterialPressure; }
    public void setMeanArterialPressure(BigDecimal meanArterialPressure) { this.meanArterialPressure = meanArterialPressure; }
    public BigDecimal getHeartRate() { return heartRate; }
    public void setHeartRate(BigDecimal heartRate) { this.heartRate = heartRate; }
    public BigDecimal getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(BigDecimal respiratoryRate) { this.respiratoryRate = respiratoryRate; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public String getTemperatureUnit() { return temperatureUnit; }
    public void setTemperatureUnit(String temperatureUnit) { this.temperatureUnit = temperatureUnit; }
    public BigDecimal getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(BigDecimal oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }
    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    public BigDecimal getBmi() { return bmi; }
    public void setBmi(BigDecimal bmi) { this.bmi = bmi; }
    public BigDecimal getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(BigDecimal bloodGlucose) { this.bloodGlucose = bloodGlucose; }
    public String getGlucoseUnit() { return glucoseUnit; }
    public void setGlucoseUnit(String glucoseUnit) { this.glucoseUnit = glucoseUnit; }
    public BigDecimal getPainScore() { return painScore; }
    public void setPainScore(BigDecimal painScore) { this.painScore = painScore; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getOxygenDeliveryMethod() { return oxygenDeliveryMethod; }
    public void setOxygenDeliveryMethod(String oxygenDeliveryMethod) { this.oxygenDeliveryMethod = oxygenDeliveryMethod; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRecordedByUsername() { return recordedByUsername; }
    public void setRecordedByUsername(String recordedByUsername) { this.recordedByUsername = recordedByUsername; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
