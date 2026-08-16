package com.sentinel.billing.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.patient.entity.Patient;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "charge_items", schema = "billing")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChargeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @Column(nullable = false, length = 100)
    private String code;

    private String description;
    private BigDecimal amount = BigDecimal.ZERO;
    private String status = "BILLED";

    @Column(nullable = false)
    private OffsetDateTime chargedAt = OffsetDateTime.now();

    public ChargeItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

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
