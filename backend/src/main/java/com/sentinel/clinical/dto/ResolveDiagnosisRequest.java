package com.sentinel.clinical.dto;

public class ResolveDiagnosisRequest {
    private String notes;

    public ResolveDiagnosisRequest() {}

    public ResolveDiagnosisRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
