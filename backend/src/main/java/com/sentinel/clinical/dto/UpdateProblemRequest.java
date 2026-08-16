package com.sentinel.clinical.dto;

import java.time.LocalDate;

public class UpdateProblemRequest {
    private String problemName;
    private String status;
    private LocalDate onsetDate;
    private LocalDate resolvedDate;
    private String notes;

    public UpdateProblemRequest() {}

    public String getProblemName() { return problemName; }
    public void setProblemName(String problemName) { this.problemName = problemName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getOnsetDate() { return onsetDate; }
    public void setOnsetDate(LocalDate onsetDate) { this.onsetDate = onsetDate; }
    public LocalDate getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDate resolvedDate) { this.resolvedDate = resolvedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
