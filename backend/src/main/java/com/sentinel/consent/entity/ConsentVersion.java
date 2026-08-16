package com.sentinel.consent.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.documents.entity.Document;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "consent_versions", schema = "consent",
       uniqueConstraints = @UniqueConstraint(columnNames = {"patient_consent_id", "version_number"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ConsentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_consent_id", nullable = false)
    private PatientConsent patientConsent;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ConsentVersion() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PatientConsent getPatientConsent() { return patientConsent; }
    public void setPatientConsent(PatientConsent patientConsent) { this.patientConsent = patientConsent; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
