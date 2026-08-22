package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CareEpisodeResponseDTO {
    private UUID id;
    private UUID organizationId;
    private UUID patientId;
    private String patientName;
    private String episodeCode;
    private String episodeType;
    private String status;
    private String title;
    private String notes;
    private String primaryDiagnosisCode;
    private String primaryDiagnosisName;
    private UUID primaryPractitionerId;
    private String primaryPractitionerName;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;
    private List<EncounterResponseDTO> encounters = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public CareEpisodeResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

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

    public UUID getPrimaryPractitionerId() { return primaryPractitionerId; }
    public void setPrimaryPractitionerId(UUID primaryPractitionerId) { this.primaryPractitionerId = primaryPractitionerId; }

    public String getPrimaryPractitionerName() { return primaryPractitionerName; }
    public void setPrimaryPractitionerName(String primaryPractitionerName) { this.primaryPractitionerName = primaryPractitionerName; }

    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }

    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }

    public List<EncounterResponseDTO> getEncounters() { return encounters; }
    public void setEncounters(List<EncounterResponseDTO> encounters) { this.encounters = encounters; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
