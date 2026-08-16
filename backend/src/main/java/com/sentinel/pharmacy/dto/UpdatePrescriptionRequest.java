package com.sentinel.pharmacy.dto;

import java.time.OffsetDateTime;

public class UpdatePrescriptionRequest {
    private String status;
    private String indication;
    private String instructions;
    private Integer refills;
    private OffsetDateTime endAt;

    public UpdatePrescriptionRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getIndication() { return indication; }
    public void setIndication(String indication) { this.indication = indication; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public Integer getRefills() { return refills; }
    public void setRefills(Integer refills) { this.refills = refills; }
    public OffsetDateTime getEndAt() { return endAt; }
    public void setEndAt(OffsetDateTime endAt) { this.endAt = endAt; }
}
