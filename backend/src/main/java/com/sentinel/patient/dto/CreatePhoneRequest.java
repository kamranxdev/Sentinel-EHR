package com.sentinel.patient.dto;

public class CreatePhoneRequest {
    private String phoneType;
    private String phoneNumber;
    private Boolean isPrimary;

    public CreatePhoneRequest() {}

    public String getPhoneType() { return phoneType; }
    public void setPhoneType(String phoneType) { this.phoneType = phoneType; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
}
