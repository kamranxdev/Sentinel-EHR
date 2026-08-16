package com.sentinel.scheduling.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ScheduleSlotResponseDTO {
    private UUID id;
    private UUID practitionerId;
    private String practitionerName;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String status;

    public ScheduleSlotResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public String getPractitionerName() { return practitionerName; }
    public void setPractitionerName(String practitionerName) { this.practitionerName = practitionerName; }
    public OffsetDateTime getStartTime() { return startTime; }
    public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }
    public OffsetDateTime getEndTime() { return endTime; }
    public void setEndTime(OffsetDateTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
