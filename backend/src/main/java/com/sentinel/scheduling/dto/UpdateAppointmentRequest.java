package com.sentinel.scheduling.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UpdateAppointmentRequest {
    private String status;
    private String reason;
    private String notes;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private UUID practitionerId;

    public UpdateAppointmentRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(OffsetDateTime startsAt) { this.startsAt = startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(OffsetDateTime endsAt) { this.endsAt = endsAt; }
    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
}
