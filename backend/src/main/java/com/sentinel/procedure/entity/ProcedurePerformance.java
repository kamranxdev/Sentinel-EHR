package com.sentinel.procedure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "procedure_performances", schema = "procedures")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProcedurePerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_order_id")
    private ProcedureOrder procedureOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private Practitioner performedBy;

    @Column(name = "performed_at")
    private OffsetDateTime performedAt;

    @Column(length = 30)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(columnDefinition = "TEXT")
    private String complications;

    public ProcedurePerformance() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public ProcedureOrder getProcedureOrder() { return procedureOrder; }
    public void setProcedureOrder(ProcedureOrder procedureOrder) { this.procedureOrder = procedureOrder; }

    public Practitioner getPerformedBy() { return performedBy; }
    public void setPerformedBy(Practitioner performedBy) { this.performedBy = performedBy; }

    public OffsetDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(OffsetDateTime performedAt) { this.performedAt = performedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }

    public String getComplications() { return complications; }
    public void setComplications(String complications) { this.complications = complications; }
}
