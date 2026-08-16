package com.sentinel.vitals.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class VitalsRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @Min(value = 30, message = "Systolic BP must be at least 30 mmHg")
    @Max(value = 300, message = "Systolic BP must not exceed 300 mmHg")
    private Integer systolicBp;

    @Min(value = 20, message = "Diastolic BP must be at least 20 mmHg")
    @Max(value = 200, message = "Diastolic BP must not exceed 200 mmHg")
    private Integer diastolicBp;

    @Min(value = 20, message = "Heart rate must be at least 20 bpm")
    @Max(value = 300, message = "Heart rate must not exceed 300 bpm")
    private Integer heartRate;

    @DecimalMin(value = "25.0", message = "Temperature must be at least 25.0 °C")
    @DecimalMax(value = "45.0", message = "Temperature must not exceed 45.0 °C")
    private Double temperature;

    @Min(value = 0, message = "SpO2 must be at least 0%")
    @Max(value = 100, message = "SpO2 must not exceed 100%")
    private Integer oxygenSaturation;

    @Min(value = 2, message = "Respiratory rate must be at least 2 breaths/min")
    @Max(value = 100, message = "Respiratory rate must not exceed 100 breaths/min")
    private Integer respiratoryRate;

    @DecimalMin(value = "0.1", message = "Weight must be at least 0.1 kg")
    @DecimalMax(value = "500.0", message = "Weight must not exceed 500.0 kg")
    private Double weightKg;

    @DecimalMin(value = "10.0", message = "Height must be at least 10.0 cm")
    @DecimalMax(value = "300.0", message = "Height must not exceed 300.0 cm")
    private Double heightCm;

    @Min(value = 10, message = "Blood glucose must be at least 10 mg/dL")
    @Max(value = 1000, message = "Blood glucose must not exceed 1000 mg/dL")
    private Integer bloodGlucose;

    @Min(value = 0, message = "Pain score must be at least 0")
    @Max(value = 10, message = "Pain score must not exceed 10")
    private Integer painScore;

    private Integer fluidIntakeMl;
    private Integer fluidOutputMl;

    private LocalDateTime recordedAt;

    public VitalsRequestDTO() {}

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

    public Integer getSystolicBp() {
        return systolicBp;
    }

    public void setSystolicBp(Integer systolicBp) {
        this.systolicBp = systolicBp;
    }

    public Integer getDiastolicBp() {
        return diastolicBp;
    }

    public void setDiastolicBp(Integer diastolicBp) {
        this.diastolicBp = diastolicBp;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(Integer oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public Integer getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Integer respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public Integer getBloodGlucose() {
        return bloodGlucose;
    }

    public void setBloodGlucose(Integer bloodGlucose) {
        this.bloodGlucose = bloodGlucose;
    }

    public Integer getPainScore() {
        return painScore;
    }

    public void setPainScore(Integer painScore) {
        this.painScore = painScore;
    }

    public Integer getFluidIntakeMl() {
        return fluidIntakeMl;
    }

    public void setFluidIntakeMl(Integer fluidIntakeMl) {
        this.fluidIntakeMl = fluidIntakeMl;
    }

    public Integer getFluidOutputMl() {
        return fluidOutputMl;
    }

    public void setFluidOutputMl(Integer fluidOutputMl) {
        this.fluidOutputMl = fluidOutputMl;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
