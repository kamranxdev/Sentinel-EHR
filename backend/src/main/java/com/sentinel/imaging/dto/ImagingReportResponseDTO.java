package com.sentinel.imaging.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ImagingReportResponseDTO {
    private UUID id;
    private UUID studyId;
    private String radiologistName;
    private String reportStatus;
    private String findings;
    private String impression;
    private OffsetDateTime reportedAt;

    public ImagingReportResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudyId() { return studyId; }
    public void setStudyId(UUID studyId) { this.studyId = studyId; }
    public String getRadiologistName() { return radiologistName; }
    public void setRadiologistName(String radiologistName) { this.radiologistName = radiologistName; }
    public String getReportStatus() { return reportStatus; }
    public void setReportStatus(String reportStatus) { this.reportStatus = reportStatus; }
    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getImpression() { return impression; }
    public void setImpression(String impression) { this.impression = impression; }
    public OffsetDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(OffsetDateTime reportedAt) { this.reportedAt = reportedAt; }
}
