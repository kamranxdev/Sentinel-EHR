package com.sentinel.insurance.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateInsurancePayerRequest {
    @NotBlank(message = "Payer name is required")
    private String name;
    private String payerCode;
    private String phone;
    private String email;

    public CreateInsurancePayerRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPayerCode() { return payerCode; }
    public void setPayerCode(String payerCode) { this.payerCode = payerCode; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
