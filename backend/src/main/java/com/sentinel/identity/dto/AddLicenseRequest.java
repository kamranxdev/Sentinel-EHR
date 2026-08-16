package com.sentinel.identity.dto;

import java.time.LocalDate;

public class AddLicenseRequest {
    private String licenseNumber;
    private String issuingAuthority;
    private String state;
    private LocalDate validFrom;
    private LocalDate validTo;

    public AddLicenseRequest() {}

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getIssuingAuthority() { return issuingAuthority; }
    public void setIssuingAuthority(String issuingAuthority) { this.issuingAuthority = issuingAuthority; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public LocalDate getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
}
