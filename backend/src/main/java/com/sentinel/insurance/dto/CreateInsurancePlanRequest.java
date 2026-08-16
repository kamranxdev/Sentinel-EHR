package com.sentinel.insurance.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateInsurancePlanRequest {
    @NotBlank(message = "Plan name is required")
    private String planName;
    private String planCode;

    public CreateInsurancePlanRequest() {}

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }
}
