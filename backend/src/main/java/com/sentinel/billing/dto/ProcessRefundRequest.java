package com.sentinel.billing.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProcessRefundRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    private String reason;

    public ProcessRefundRequest() {}

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
