package com.sentinel.scheduling.dto;

import java.math.BigDecimal;

public class AppointmentTriageRequest {
    private BigDecimal systolicBp;
    private BigDecimal diastolicBp;
    private BigDecimal heartRate;
    private BigDecimal respiratoryRate;
    private BigDecimal temperature;
    private BigDecimal oxygenSaturation;
    private String notes;

    public AppointmentTriageRequest() {}

    public BigDecimal getSystolicBp() { return systolicBp; }
    public void setSystolicBp(BigDecimal systolicBp) { this.systolicBp = systolicBp; }
    public BigDecimal getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(BigDecimal diastolicBp) { this.diastolicBp = diastolicBp; }
    public BigDecimal getHeartRate() { return heartRate; }
    public void setHeartRate(BigDecimal heartRate) { this.heartRate = heartRate; }
    public BigDecimal getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(BigDecimal respiratoryRate) { this.respiratoryRate = respiratoryRate; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public BigDecimal getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(BigDecimal oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
