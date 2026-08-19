package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ClinicalDocumentResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private String documentType;
    private String title;
    private String status;
    private String authorEmail;
    private OffsetDateTime authoredAt;
    private OffsetDateTime createdAt;
    private List<VersionDTO> versions;

    public ClinicalDocumentResponseDTO() {}

    public static class VersionDTO {
        private UUID id;
        private Integer versionNumber;
        private String content;
        private String authoredByEmail;
        private String amendmentReason;
        private OffsetDateTime authoredAt;

        public VersionDTO() {}

        public VersionDTO(UUID id, Integer versionNumber, String content, String authoredByEmail, String amendmentReason, OffsetDateTime authoredAt) {
            this.id = id;
            this.versionNumber = versionNumber;
            this.content = content;
            this.authoredByEmail = authoredByEmail;
            this.amendmentReason = amendmentReason;
            this.authoredAt = authoredAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public Integer getVersionNumber() { return versionNumber; }
        public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getAuthoredByEmail() { return authoredByEmail; }
        public void setAuthoredByEmail(String authoredByEmail) { this.authoredByEmail = authoredByEmail; }
        public String getAmendmentReason() { return amendmentReason; }
        public void setAmendmentReason(String amendmentReason) { this.amendmentReason = amendmentReason; }
        public OffsetDateTime getAuthoredAt() { return authoredAt; }
        public void setAuthoredAt(OffsetDateTime authoredAt) { this.authoredAt = authoredAt; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
    public OffsetDateTime getAuthoredAt() { return authoredAt; }
    public void setAuthoredAt(OffsetDateTime authoredAt) { this.authoredAt = authoredAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<VersionDTO> getVersions() { return versions; }
    public void setVersions(List<VersionDTO> versions) { this.versions = versions; }
}
