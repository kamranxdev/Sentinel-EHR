package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;

public class UpdateDiagnosisRequest {
    private String conditionName;
    private String icdCode;
    private String snomedCode;
    private String status;
    private OffsetDateTime onsetDate;
    private String notes;

    public UpdateDiagnosisRequest() {}

    public String getConditionName() { return conditionName; }
    public void setConditionName(String conditionName) { this.conditionName = conditionName; }
    public String getIcdCode() { return icdCode; }
    public void setIcdCode(String icdCode) { this.icdCode = icdCode; }
    public String getSnomedCode() { return snomedCode; }
    public void setSnomedCode(String snomedCode) { this.snomedCode = snomedCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getOnsetDate() { return onsetDate; }
    public void setOnsetDate(OffsetDateTime onsetDate) { this.onsetDate = onsetDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
