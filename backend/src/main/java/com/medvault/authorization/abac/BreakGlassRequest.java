package com.medvault.authorization.abac;

import java.time.LocalDateTime;

public class BreakGlassRequest {
    private Long id;
    private Long patientId;
    private String doctorUsername;
    private String justification;
    private LocalDateTime requestedAt;
    private boolean approved;

    public BreakGlassRequest() {}

    public BreakGlassRequest(Long id, Long patientId, String doctorUsername, String justification, LocalDateTime requestedAt, boolean approved) {
        this.id = id;
        this.patientId = patientId;
        this.doctorUsername = doctorUsername;
        this.justification = justification;
        this.requestedAt = requestedAt;
        this.approved = approved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getDoctorUsername() {
        return doctorUsername;
    }

    public void setDoctorUsername(String doctorUsername) {
        this.doctorUsername = doctorUsername;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
}
