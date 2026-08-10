package com.sentinel.vitals.dto;

import jakarta.validation.constraints.NotNull;

public class VitalsRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String bloodPressure;
    private Integer heartRate;
    private Double temperature;
    private Integer oxygenSaturation;
    private Integer respiratoryRate;
    private Double weightKg;
    private Double heightCm;
    private Integer bloodGlucose;
    private Integer painScore;
    private Integer fluidIntakeMl;
    private Integer fluidOutputMl;

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

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
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
}
