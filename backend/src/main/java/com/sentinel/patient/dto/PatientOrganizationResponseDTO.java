package com.sentinel.patient.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PatientOrganizationResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID organizationId;
    private String organizationName;
    private String mrn;
    private String patientStatus;
    private UUID primaryFacilityId;
    private String primaryFacilityName;
    private OffsetDateTime registeredAt;

    public PatientOrganizationResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }
    public String getPatientStatus() { return patientStatus; }
    public void setPatientStatus(String patientStatus) { this.patientStatus = patientStatus; }
    public UUID getPrimaryFacilityId() { return primaryFacilityId; }
    public void setPrimaryFacilityId(UUID primaryFacilityId) { this.primaryFacilityId = primaryFacilityId; }
    public String getPrimaryFacilityName() { return primaryFacilityName; }
    public void setPrimaryFacilityName(String primaryFacilityName) { this.primaryFacilityName = primaryFacilityName; }
    public OffsetDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(OffsetDateTime registeredAt) { this.registeredAt = registeredAt; }
}
