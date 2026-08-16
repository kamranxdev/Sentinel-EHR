package com.sentinel.clinical.dto;

import java.time.LocalDate;

public class ResolveProblemRequest {
    private LocalDate resolvedDate;
    private String notes;

    public ResolveProblemRequest() {}

    public ResolveProblemRequest(LocalDate resolvedDate, String notes) {
        this.resolvedDate = resolvedDate;
        this.notes = notes;
    }

    public LocalDate getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDate resolvedDate) { this.resolvedDate = resolvedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
