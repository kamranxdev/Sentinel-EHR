package com.sentinel.insurance.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class InsuranceClaimResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID organizationId;
    private UUID payerId;
    private String payerName;
    private String claimNumber;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal approvedAmount;
    private BigDecimal rejectedAmount;
    private OffsetDateTime submittedAt;
    private List<ClaimItemDTO> items;

    public InsuranceClaimResponseDTO() {}

    public static class ClaimItemDTO {
        private UUID id;
        private UUID chargeItemId;
        private String serviceCode;
        private String description;
        private BigDecimal quantity;
        private BigDecimal billedAmount;
        private BigDecimal approvedAmount;
        private BigDecimal rejectedAmount;

        public ClaimItemDTO() {}

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
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
        public BigDecimal getApprovedAmount() { return approvedAmount; }
        public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
        public BigDecimal getRejectedAmount() { return rejectedAmount; }
        public void setRejectedAmount(BigDecimal rejectedAmount) { this.rejectedAmount = rejectedAmount; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getPayerId() { return payerId; }
    public void setPayerId(UUID payerId) { this.payerId = payerId; }
    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }
    public BigDecimal getRejectedAmount() { return rejectedAmount; }
    public void setRejectedAmount(BigDecimal rejectedAmount) { this.rejectedAmount = rejectedAmount; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }
    public List<ClaimItemDTO> getItems() { return items; }
    public void setItems(List<ClaimItemDTO> items) { this.items = items; }
}
