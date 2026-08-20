package com.sentinel.scheduling.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class CreateAppointmentRequest {
    private UUID organizationId;
    private UUID departmentId;
    @NotNull(message = "Patient ID is required")
    private UUID patientId;
    private UUID practitionerId;
    @NotNull(message = "Start time is required")
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private String reason;
    private String notes;
    private String schedulingMode;
    private String specialtyCode;
    private String encounterType;

    public CreateAppointmentRequest() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(OffsetDateTime startsAt) { this.startsAt = startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(OffsetDateTime endsAt) { this.endsAt = endsAt; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getSchedulingMode() { return schedulingMode; }
    public void setSchedulingMode(String schedulingMode) { this.schedulingMode = schedulingMode; }
    public String getSpecialtyCode() { return specialtyCode; }
    public void setSpecialtyCode(String specialtyCode) { this.specialtyCode = specialtyCode; }
    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }
}
