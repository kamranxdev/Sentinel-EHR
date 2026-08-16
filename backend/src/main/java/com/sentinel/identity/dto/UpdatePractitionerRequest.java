package com.sentinel.identity.dto;

public class UpdatePractitionerRequest {
    private String practitionerType;
    private String primarySpecialty;
    private String status;

    public UpdatePractitionerRequest() {}

    public String getPractitionerType() { return practitionerType; }
    public void setPractitionerType(String practitionerType) { this.practitionerType = practitionerType; }
    public String getPrimarySpecialty() { return primarySpecialty; }
    public void setPrimarySpecialty(String primarySpecialty) { this.primarySpecialty = primarySpecialty; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
