package com.sentinel.tenancy.dto;

import java.util.UUID;

public class CreateBedRequest {
    private String bedNumber;
    private String bedType;
    private String bedCode;

    public CreateBedRequest() {}

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }
    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }
    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }
}
