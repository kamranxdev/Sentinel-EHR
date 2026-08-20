package com.sentinel.scheduling.dto;

public class AppointmentNoShowRequest {
    private String notes;
    private String reportedBy;

    public AppointmentNoShowRequest() {}

    public AppointmentNoShowRequest(String notes, String reportedBy) {
        this.notes = notes;
        this.reportedBy = reportedBy;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
}
