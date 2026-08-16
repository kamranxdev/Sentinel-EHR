package com.sentinel.patient.dto;

import java.util.UUID;

public class RegisterPatientOrganizationRequest {
    private String mrn;
    private UUID primaryFacilityId;

    public RegisterPatientOrganizationRequest() {}

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }
    public UUID getPrimaryFacilityId() { return primaryFacilityId; }
    public void setPrimaryFacilityId(UUID primaryFacilityId) { this.primaryFacilityId = primaryFacilityId; }
}
