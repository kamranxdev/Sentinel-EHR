package com.sentinel.clinical.dto;

import java.util.UUID;

public class AdmissionRequest {
    private String admissionSource;
    private String admitReason;
    private UUID bedId;
    private UUID wardId;
    private String notes;

    public AdmissionRequest() {}

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }
    public String getAdmitReason() { return admitReason; }
    public void setAdmitReason(String admitReason) { this.admitReason = admitReason; }
    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }
    public UUID getWardId() { return wardId; }
    public void setWardId(UUID wardId) { this.wardId = wardId; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
