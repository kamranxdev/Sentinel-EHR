package com.sentinel.insurance.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class UpdateInsuranceAuthorizationRequest {
    private String status;
    private BigDecimal approvedAmount;
    private String authorizationNumber;
    private OffsetDateTime expiresAt;

    public UpdateInsuranceAuthorizationRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
    public String getAuthorizationNumber() { return authorizationNumber; }
    public void setAuthorizationNumber(String authorizationNumber) { this.authorizationNumber = authorizationNumber; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
}
