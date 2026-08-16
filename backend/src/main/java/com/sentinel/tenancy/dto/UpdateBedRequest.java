package com.sentinel.tenancy.dto;

public class UpdateBedRequest {
    private String bedNumber;
    private String bedType;
    private String bedCode;
    private String status;

    public UpdateBedRequest() {}

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }
    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }
    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
