package com.sentinel.billing.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class CreateBillingAccountRequest {
    private UUID organizationId;
    private String accountNumber;
    private BigDecimal initialBalance;

    public CreateBillingAccountRequest() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public BigDecimal getInitialBalance() { return initialBalance; }
    public void setInitialBalance(BigDecimal initialBalance) { this.initialBalance = initialBalance; }
}
