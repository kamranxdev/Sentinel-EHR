package com.sentinel.billing.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ChargeItemResponseDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID encounterId;
    private String code;
    private String description;
    private BigDecimal amount;
    private String status;
    private OffsetDateTime chargedAt;

    public ChargeItemResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getChargedAt() { return chargedAt; }
    public void setChargedAt(OffsetDateTime chargedAt) { this.chargedAt = chargedAt; }
}
