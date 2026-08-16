package com.sentinel.billing.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class RefundResponseDTO {
    private UUID id;
    private UUID paymentId;
    private BigDecimal amount;
    private String reason;
    private String status;
    private OffsetDateTime requestedAt;
    private OffsetDateTime processedAt;
    private String processedByUsername;

    public RefundResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(OffsetDateTime requestedAt) { this.requestedAt = requestedAt; }
    public OffsetDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(OffsetDateTime processedAt) { this.processedAt = processedAt; }
    public String getProcessedByUsername() { return processedByUsername; }
    public void setProcessedByUsername(String processedByUsername) { this.processedByUsername = processedByUsername; }
}
