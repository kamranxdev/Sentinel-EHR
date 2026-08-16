package com.sentinel.insurance.dto;

import java.math.BigDecimal;

public class UpdateInsuranceClaimRequest {
    private String status;
    private BigDecimal approvedAmount;
    private BigDecimal rejectedAmount;
    private String response;

    public UpdateInsuranceClaimRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
    public BigDecimal getRejectedAmount() { return rejectedAmount; }
    public void setRejectedAmount(BigDecimal rejectedAmount) { this.rejectedAmount = rejectedAmount; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
