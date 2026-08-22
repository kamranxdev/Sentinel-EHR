package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UpdateCareEpisodeRequest {
    private String episodeType;
    private String status;
    private String title;
    private String notes;
    private String primaryDiagnosisCode;
    private String primaryDiagnosisName;
    private UUID primaryPractitionerId;
    private OffsetDateTime endedAt;

    public UpdateCareEpisodeRequest() {}

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

    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }
}
