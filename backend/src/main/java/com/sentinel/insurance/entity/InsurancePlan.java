package com.sentinel.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "insurance_plans", schema = "insurance")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InsurancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payer_id", nullable = false)
    private InsurancePayer payer;

    @Column(name = "plan_name", nullable = false, length = 255)
    private String planName;

    @Column(name = "plan_code", length = 100)
    private String planCode;

    @Column(nullable = false)
    private Boolean active = true;

    public InsurancePlan() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public InsurancePayer getPayer() { return payer; }
    public void setPayer(InsurancePayer payer) { this.payer = payer; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
