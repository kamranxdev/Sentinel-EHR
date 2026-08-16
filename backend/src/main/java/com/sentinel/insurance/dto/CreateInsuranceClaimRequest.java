package com.sentinel.insurance.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CreateInsuranceClaimRequest {
    @NotNull(message = "Payer ID is required")
    private UUID payerId;
    private String claimNumber;
    private BigDecimal totalAmount;
    private List<ClaimItemRequest> items;

    public CreateInsuranceClaimRequest() {}

    public static class ClaimItemRequest {
        private UUID chargeItemId;
        private String serviceCode;
        private String description;
        private BigDecimal quantity;
        private BigDecimal billedAmount;

        public ClaimItemRequest() {}

        public UUID getChargeItemId() { return chargeItemId; }
        public void setChargeItemId(UUID chargeItemId) { this.chargeItemId = chargeItemId; }
        public String getServiceCode() { return serviceCode; }
        public void setServiceCode(String serviceCode) { this.serviceCode = serviceCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getBilledAmount() { return billedAmount; }
        public void setBilledAmount(BigDecimal billedAmount) { this.billedAmount = billedAmount; }
    }

    public UUID getPayerId() { return payerId; }
    public void setPayerId(UUID payerId) { this.payerId = payerId; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public List<ClaimItemRequest> getItems() { return items; }
    public void setItems(List<ClaimItemRequest> items) { this.items = items; }
}
