package com.sentinel.scheduling.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AppointmentResponseDTO {
    private UUID id;
    private UUID organizationId;
    private UUID departmentId;
    private UUID patientId;
    private String patientName;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private String status;
    private String reason;
    private String notes;
    private UUID doctorId;
    private String doctorName;
    private UUID practitionerId;
    private String practitionerName;
    private String schedulingMode;
    private String specialtyCode;
    private String encounterType;
    private UUID encounterId;
    private OffsetDateTime checkedInAt;
    private OffsetDateTime arrivedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime noShowAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private com.sentinel.clinical.dto.VitalsResponseDTO vitals;

    public AppointmentResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public UUID getDoctorId() { return doctorId; }
    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public String getPractitionerName() { return practitionerName; }
    public void setPractitionerName(String practitionerName) { this.practitionerName = practitionerName; }
    public String getSchedulingMode() { return schedulingMode; }
    public void setSchedulingMode(String schedulingMode) { this.schedulingMode = schedulingMode; }
    public String getSpecialtyCode() { return specialtyCode; }
    public void setSpecialtyCode(String specialtyCode) { this.specialtyCode = specialtyCode; }
    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(OffsetDateTime startsAt) { this.startsAt = startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(OffsetDateTime endsAt) { this.endsAt = endsAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public OffsetDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(OffsetDateTime checkedInAt) { this.checkedInAt = checkedInAt; }
    public OffsetDateTime getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(OffsetDateTime arrivedAt) { this.arrivedAt = arrivedAt; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }
    public OffsetDateTime getNoShowAt() { return noShowAt; }
    public void setNoShowAt(OffsetDateTime noShowAt) { this.noShowAt = noShowAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public com.sentinel.clinical.dto.VitalsResponseDTO getVitals() { return vitals; }
    public void setVitals(com.sentinel.clinical.dto.VitalsResponseDTO vitals) { this.vitals = vitals; }
}

