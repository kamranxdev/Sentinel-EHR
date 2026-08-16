package com.sentinel.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AddInvoiceItemRequest {
    @NotBlank(message = "Description is required")
    private String description;
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    public AddInvoiceItemRequest() {}

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
