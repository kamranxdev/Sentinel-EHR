package com.sentinel.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "insurance_claim_items", schema = "insurance")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InsuranceClaimItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private InsuranceClaim claim;

    @Column(name = "charge_item_id")
    private UUID chargeItemId;

    @Column(name = "service_code", length = 100)
    private String serviceCode;

    @Column(length = 255)
    private String description;

    @Column(precision = 12, scale = 4)
    private BigDecimal quantity;

    @Column(name = "billed_amount", precision = 19, scale = 4)
    private BigDecimal billedAmount;

    @Column(name = "approved_amount", precision = 19, scale = 4)
    private BigDecimal approvedAmount;

    @Column(name = "rejected_amount", precision = 19, scale = 4)
    private BigDecimal rejectedAmount;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    public InsuranceClaimItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public InsuranceClaim getClaim() { return claim; }
    public void setClaim(InsuranceClaim claim) { this.claim = claim; }

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

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
