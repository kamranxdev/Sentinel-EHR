package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "care_episodes", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CareEpisode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "episode_code", nullable = false, length = 50)
    private String episodeCode;

    @Column(name = "episode_type", nullable = false, length = 50)
    private String episodeType = "OUTPATIENT_CARE";

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "primary_diagnosis_code", length = 50)
    private String primaryDiagnosisCode;

    @Column(name = "primary_diagnosis_name", length = 255)
    private String primaryDiagnosisName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_practitioner_id")
    private User primaryPractitioner;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public CareEpisode() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getEpisodeCode() { return episodeCode; }
    public void setEpisodeCode(String episodeCode) { this.episodeCode = episodeCode; }

    public String getEpisodeType() { return episodeType; }
    public void setEpisodeType(String episodeType) { this.episodeType = episodeType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPrimaryDiagnosisCode() { return primaryDiagnosisCode; }
    public void setPrimaryDiagnosisCode(String primaryDiagnosisCode) { this.primaryDiagnosisCode = primaryDiagnosisCode; }

    public String getPrimaryDiagnosisName() { return primaryDiagnosisName; }
    public void setPrimaryDiagnosisName(String primaryDiagnosisName) { this.primaryDiagnosisName = primaryDiagnosisName; }

    public User getPrimaryPractitioner() { return primaryPractitioner; }
    public void setPrimaryPractitioner(User primaryPractitioner) { this.primaryPractitioner = primaryPractitioner; }

    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }

    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
