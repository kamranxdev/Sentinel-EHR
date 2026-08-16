package com.sentinel.billing.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RecordPaymentRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionReference;

    public RecordPaymentRequest() {}

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
}
