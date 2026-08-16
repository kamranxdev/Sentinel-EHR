package com.sentinel.clinical.dto;

public class DischargePatientRequest {
    private String dischargeDisposition;
    private String dischargeSummary;

    public DischargePatientRequest() {}

    public String getDischargeDisposition() { return dischargeDisposition; }
    public void setDischargeDisposition(String dischargeDisposition) { this.dischargeDisposition = dischargeDisposition; }
    public String getDischargeSummary() { return dischargeSummary; }
    public void setDischargeSummary(String dischargeSummary) { this.dischargeSummary = dischargeSummary; }
}
