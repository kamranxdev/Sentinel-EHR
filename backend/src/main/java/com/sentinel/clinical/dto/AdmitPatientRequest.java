package com.sentinel.clinical.dto;

import java.util.UUID;

public class AdmitPatientRequest {
    private String admissionSource;
    private String admitReason;
    private UUID bedId;

    public AdmitPatientRequest() {}

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }
    public String getAdmitReason() { return admitReason; }
    public void setAdmitReason(String admitReason) { this.admitReason = admitReason; }
    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }
}
