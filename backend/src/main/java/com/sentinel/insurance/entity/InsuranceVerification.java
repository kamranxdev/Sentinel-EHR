package com.sentinel.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "insurance_verifications", schema = "insurance")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InsuranceVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_insurance_id", nullable = false)
    private PatientInsurance patientInsurance;

    @Column(nullable = false)
    private OffsetDateTime verifiedAt = OffsetDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(columnDefinition = "json")
    private String response;

    public InsuranceVerification() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PatientInsurance getPatientInsurance() { return patientInsurance; }
    public void setPatientInsurance(PatientInsurance patientInsurance) { this.patientInsurance = patientInsurance; }

    public OffsetDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(OffsetDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
