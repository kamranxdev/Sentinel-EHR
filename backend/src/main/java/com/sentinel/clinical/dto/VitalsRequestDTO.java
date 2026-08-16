package com.sentinel.clinical.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class VitalsRequestDTO {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private BigDecimal systolicBp;
    private BigDecimal diastolicBp;
    private BigDecimal heartRate;
    private BigDecimal temperature;
    private BigDecimal oxygenSaturation;
    private BigDecimal respiratoryRate;
    private BigDecimal weightKg;
    private BigDecimal heightCm;
    private BigDecimal bloodGlucose;
    private BigDecimal painScore;
    private OffsetDateTime recordedAt;

    public VitalsRequestDTO() {}

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public BigDecimal getSystolicBp() { return systolicBp; }
    public void setSystolicBp(BigDecimal systolicBp) { this.systolicBp = systolicBp; }

    public BigDecimal getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(BigDecimal diastolicBp) { this.diastolicBp = diastolicBp; }

    public BigDecimal getHeartRate() { return heartRate; }
    public void setHeartRate(BigDecimal heartRate) { this.heartRate = heartRate; }

    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }

    public BigDecimal getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(BigDecimal oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }

    public BigDecimal getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(BigDecimal respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }

    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }

    public BigDecimal getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(BigDecimal bloodGlucose) { this.bloodGlucose = bloodGlucose; }

    public BigDecimal getPainScore() { return painScore; }
    public void setPainScore(BigDecimal painScore) { this.painScore = painScore; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
