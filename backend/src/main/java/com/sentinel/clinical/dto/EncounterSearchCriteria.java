package com.sentinel.clinical.dto;

import java.util.UUID;

public class EncounterSearchCriteria {
    private UUID patientId;
    private UUID organizationId;
    private String status;
    private String encounterType;

    public EncounterSearchCriteria() {}

    public EncounterSearchCriteria(UUID patientId, UUID organizationId, String status, String encounterType) {
        this.patientId = patientId;
        this.organizationId = organizationId;
        this.status = status;
        this.encounterType = encounterType;
    }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }
}
