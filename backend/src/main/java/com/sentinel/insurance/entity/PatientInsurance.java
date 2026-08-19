package com.sentinel.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_insurance", schema = "insurance")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientInsurance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payer_id", nullable = false)
    private InsurancePayer payer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private InsurancePlan plan;

    @Column(name = "policy_number", length = 150)
    private String policyNumber;

    @Column(name = "member_id", length = 150)
    private String memberId;

    @Column(name = "group_number", length = 150)
    private String groupNumber;

    @Column(name = "subscriber_name", length = 255)
    private String subscriberName;

    @Column(name = "subscriber_relationship", length = 50)
    private String subscriberRelationship;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    public PatientInsurance() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public InsurancePayer getPayer() { return payer; }
    public void setPayer(InsurancePayer payer) { this.payer = payer; }

    public InsurancePlan getPlan() { return plan; }
    public void setPlan(InsurancePlan plan) { this.plan = plan; }

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
