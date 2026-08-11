package com.sentinel.laboratory.entity;

import com.sentinel.encounters.entity.Encounter;
import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imaging_orders")
public class ImagingOrder {
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
    private String modality; // XRAY, CT, MRI, ULTRASOUND, PET

    @Column(nullable = false)
    private String procedureName; // Chest X-Ray 2 Views, MRI Brain W/WO Contrast

    private String cptCode;

    @Column(nullable = false)
    private String status = "ORDERED"; // ORDERED, SCHEDULED, PERFORMED, REPORT_GENERATED, CLINICIAN_REVIEWED

    private String dicomStudyInstanceUid;

    @Column(length = 4000)
    private String radiologistReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "radiologist_id")
    private User radiologist;

    private LocalDateTime orderedAt = LocalDateTime.now();
    private LocalDateTime scheduledAt;
    private LocalDateTime performedAt;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime reviewedAt;

    public ImagingOrder() {}

    public ImagingOrder(Patient patient, Encounter encounter, User orderingProvider, String modality, String procedureName, String cptCode) {
        this.patient = patient;
        this.encounter = encounter;
        this.orderingProvider = orderingProvider;
        this.modality = modality;
        this.procedureName = procedureName;
        this.cptCode = cptCode;
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

    public String getModality() {
        return modality;
    }

    public void setModality(String modality) {
        this.modality = modality;
    }

    public String getProcedureName() {
        return procedureName;
    }

    public void setProcedureName(String procedureName) {
        this.procedureName = procedureName;
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

    public String getDicomStudyInstanceUid() {
        return dicomStudyInstanceUid;
    }

    public void setDicomStudyInstanceUid(String dicomStudyInstanceUid) {
        this.dicomStudyInstanceUid = dicomStudyInstanceUid;
    }

    public String getRadiologistReport() {
        return radiologistReport;
    }

    public void setRadiologistReport(String radiologistReport) {
        this.radiologistReport = radiologistReport;
    }

    public User getRadiologist() {
        return radiologist;
    }

    public void setRadiologist(User radiologist) {
        this.radiologist = radiologist;
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

    public LocalDateTime getReportGeneratedAt() {
        return reportGeneratedAt;
    }

    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) {
        this.reportGeneratedAt = reportGeneratedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
