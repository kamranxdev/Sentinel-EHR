package com.sentinel.identity.dto;

public class AddSpecialtyRequest {
    private String specialtyCode;
    private String specialtyName;
    private Boolean isPrimary;

    public AddSpecialtyRequest() {}

    public String getSpecialtyCode() { return specialtyCode; }
    public void setSpecialtyCode(String specialtyCode) { this.specialtyCode = specialtyCode; }
    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
}
