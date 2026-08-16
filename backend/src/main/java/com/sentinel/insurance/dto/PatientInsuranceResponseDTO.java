package com.sentinel.insurance.dto;

import java.time.LocalDate;
import java.util.UUID;

public class PatientInsuranceResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID organizationId;
    private UUID payerId;
    private String payerName;
    private UUID planId;
    private String planName;
    private String policyNumber;
    private String memberId;
    private String groupNumber;
    private String subscriberName;
    private String subscriberRelationship;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isPrimary;
    private String status;

    public PatientInsuranceResponseDTO() {}

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
    public UUID getPlanId() { return planId; }
    public void setPlanId(UUID planId) { this.planId = planId; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getGroupNumber() { return groupNumber; }
    public void setGroupNumber(String groupNumber) { this.groupNumber = groupNumber; }
    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }
    public String getSubscriberRelationship() { return subscriberRelationship; }
    public void setSubscriberRelationship(String subscriberRelationship) { this.subscriberRelationship = subscriberRelationship; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
