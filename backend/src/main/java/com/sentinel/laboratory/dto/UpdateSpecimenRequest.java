package com.sentinel.laboratory.dto;

import java.time.OffsetDateTime;

public class UpdateSpecimenRequest {
    private String status;
    private OffsetDateTime receivedAt;

    public UpdateSpecimenRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(OffsetDateTime receivedAt) { this.receivedAt = receivedAt; }
}
