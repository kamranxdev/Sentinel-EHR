package com.sentinel.clinical.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class CreateCareEpisodeRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private UUID organizationId;
    private String episodeType; // OUTPATIENT_CARE, EMERGENCY_EPISODE, ACUTE_ILLNESS, CHRONIC_CARE, SURGICAL_EPISODE
    private String title;
    private String notes;
    private String primaryDiagnosisCode;
    private String primaryDiagnosisName;
    private UUID primaryPractitionerId;
    private OffsetDateTime startedAt;

    public CreateCareEpisodeRequest() {}

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public String getEpisodeType() { return episodeType; }
    public void setEpisodeType(String episodeType) { this.episodeType = episodeType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPrimaryDiagnosisCode() { return primaryDiagnosisCode; }
    public void setPrimaryDiagnosisCode(String primaryDiagnosisCode) { this.primaryDiagnosisCode = primaryDiagnosisCode; }

    public String getPrimaryDiagnosisName() { return primaryDiagnosisName; }
    public void setPrimaryDiagnosisName(String primaryDiagnosisName) { this.primaryDiagnosisName = primaryDiagnosisName; }

    public UUID getPrimaryPractitionerId() { return primaryPractitionerId; }
    public void setPrimaryPractitionerId(UUID primaryPractitionerId) { this.primaryPractitionerId = primaryPractitionerId; }

    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
}
