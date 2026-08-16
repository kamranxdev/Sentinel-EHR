package com.sentinel.scheduling.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class CreateScheduleSlotRequest {
    @NotNull(message = "Practitioner ID is required")
    private UUID practitionerId;
    @NotNull(message = "Start time is required")
    private OffsetDateTime startTime;
    @NotNull(message = "End time is required")
    private OffsetDateTime endTime;

    public CreateScheduleSlotRequest() {}

    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public OffsetDateTime getStartTime() { return startTime; }
    public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }
    public OffsetDateTime getEndTime() { return endTime; }
    public void setEndTime(OffsetDateTime endTime) { this.endTime = endTime; }
}
