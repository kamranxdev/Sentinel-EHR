package com.sentinel.scheduling.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public class AppointmentRescheduleRequest {
    @NotNull(message = "New start time is required")
    private OffsetDateTime newStartsAt;
    private OffsetDateTime newEndsAt;
    private String reason;

    public AppointmentRescheduleRequest() {}

    public OffsetDateTime getNewStartsAt() { return newStartsAt; }
    public void setNewStartsAt(OffsetDateTime newStartsAt) { this.newStartsAt = newStartsAt; }
    public OffsetDateTime getNewEndsAt() { return newEndsAt; }
    public void setNewEndsAt(OffsetDateTime newEndsAt) { this.newEndsAt = newEndsAt; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
