package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;

public class AddDiagnosisRequest {
    private String conditionName;
    private String icdCode;
    private String snomedCode;
    private OffsetDateTime onsetDate;
    private String notes;

    public AddDiagnosisRequest() {}

    public String getConditionName() { return conditionName; }
    public void setConditionName(String conditionName) { this.conditionName = conditionName; }
    public String getIcdCode() { return icdCode; }
    public void setIcdCode(String icdCode) { this.icdCode = icdCode; }
    public String getSnomedCode() { return snomedCode; }
    public void setSnomedCode(String snomedCode) { this.snomedCode = snomedCode; }
    public OffsetDateTime getOnsetDate() { return onsetDate; }
    public void setOnsetDate(OffsetDateTime onsetDate) { this.onsetDate = onsetDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
