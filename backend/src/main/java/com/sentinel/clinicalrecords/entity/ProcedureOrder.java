package com.sentinel.clinicalrecords.entity;

import com.sentinel.encounters.entity.Encounter;
import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "procedure_orders")
public class ProcedureOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    private Encounter encounter;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ordering_provider_id", nullable = false)
    private User orderingProvider;

    @Column(nullable = false)
    private String procedureName; // e.g. Appendectomy, Bedside Central Line Placement

    private String snomedCode;
    private String cptCode;

    @Column(nullable = false)
    private String status = "ORDERED"; // ORDERED, SCHEDULED, PRE_PROCEDURE, PERFORMED, POST_PROCEDURE, DOCUMENTED

    @Column(length = 4000)
    private String operativeReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceduralist_id")
    private User proceduralist;

    private LocalDateTime orderedAt = LocalDateTime.now();
    private LocalDateTime scheduledAt;
    private LocalDateTime performedAt;
    private LocalDateTime documentedAt;

    public ProcedureOrder() {}

    public ProcedureOrder(Patient patient, Encounter encounter, User orderingProvider, String procedureName, String snomedCode) {
        this.patient = patient;
        this.encounter = encounter;
        this.orderingProvider = orderingProvider;
        this.procedureName = procedureName;
        this.snomedCode = snomedCode;
        this.status = "ORDERED";
        this.orderedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Encounter getEncounter() {
        return encounter;
    }

    public void setEncounter(Encounter encounter) {
        this.encounter = encounter;
    }

    public User getOrderingProvider() {
        return orderingProvider;
    }

    public void setOrderingProvider(User orderingProvider) {
        this.orderingProvider = orderingProvider;
    }

    public String getProcedureName() {
        return procedureName;
    }

    public void setProcedureName(String procedureName) {
        this.procedureName = procedureName;
    }

    public String getSnomedCode() {
        return snomedCode;
    }

    public void setSnomedCode(String snomedCode) {
        this.snomedCode = snomedCode;
    }

    public String getCptCode() {
        return cptCode;
    }

    public void setCptCode(String cptCode) {
        this.cptCode = cptCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOperativeReport() {
        return operativeReport;
    }

    public void setOperativeReport(String operativeReport) {
        this.operativeReport = operativeReport;
    }

    public User getProceduralist() {
        return proceduralist;
    }

    public void setProceduralist(User proceduralist) {
        this.proceduralist = proceduralist;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public LocalDateTime getDocumentedAt() {
        return documentedAt;
    }

    public void setDocumentedAt(LocalDateTime documentedAt) {
        this.documentedAt = documentedAt;
    }
}
