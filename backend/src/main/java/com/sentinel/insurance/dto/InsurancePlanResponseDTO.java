package com.sentinel.insurance.dto;

import java.util.UUID;

public class InsurancePlanResponseDTO {
    private UUID id;
    private UUID payerId;
    private String planName;
    private String planCode;
    private Boolean active;

    public InsurancePlanResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPayerId() { return payerId; }
    public void setPayerId(UUID payerId) { this.payerId = payerId; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
