package com.sentinel.patient.dto;

import java.util.UUID;

public class RegisterPatientOrganizationRequest {
    private String mrn;

    public RegisterPatientOrganizationRequest() {}

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }
}
