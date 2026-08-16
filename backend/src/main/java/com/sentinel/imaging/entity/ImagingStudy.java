package com.sentinel.imaging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "imaging_studies", schema = "imaging")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ImagingStudy {

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
    @JoinColumn(name = "imaging_order_id")
    private ImagingOrder imagingOrder;

    @Column(name = "accession_number", length = 100)
    private String accessionNumber;

    @Column(name = "study_instance_uid", unique = true, length = 255)
    private String studyInstanceUid;

    @Column(length = 50)
    private String modality;

    @Column(name = "performed_at")
    private OffsetDateTime performedAt;

    @Column(name = "pacs_reference", columnDefinition = "TEXT")
    private String pacsReference;

    @Column(length = 30)
    private String status;

    public ImagingStudy() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public ImagingOrder getImagingOrder() { return imagingOrder; }
    public void setImagingOrder(ImagingOrder imagingOrder) { this.imagingOrder = imagingOrder; }

    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }

    public String getStudyInstanceUid() { return studyInstanceUid; }
    public void setStudyInstanceUid(String studyInstanceUid) { this.studyInstanceUid = studyInstanceUid; }

    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }

    public OffsetDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(OffsetDateTime performedAt) { this.performedAt = performedAt; }

    public String getPacsReference() { return pacsReference; }
    public void setPacsReference(String pacsReference) { this.pacsReference = pacsReference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
