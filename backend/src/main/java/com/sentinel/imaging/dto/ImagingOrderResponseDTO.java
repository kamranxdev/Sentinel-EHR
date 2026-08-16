package com.sentinel.imaging.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ImagingOrderResponseDTO {
    private Long id;
    private UUID patientId;
    private UUID encounterId;
    private String orderingProviderUsername;
    private String modality;
    private String procedureName;
    private String cptCode;
    private String status;
    private String dicomStudyInstanceUid;
    private String radiologistReport;
    private String radiologistUsername;
    private LocalDateTime orderedAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime performedAt;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime reviewedAt;

    public ImagingOrderResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getOrderingProviderUsername() { return orderingProviderUsername; }
    public void setOrderingProviderUsername(String orderingProviderUsername) { this.orderingProviderUsername = orderingProviderUsername; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public String getProcedureName() { return procedureName; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }
    public String getCptCode() { return cptCode; }
    public void setCptCode(String cptCode) { this.cptCode = cptCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDicomStudyInstanceUid() { return dicomStudyInstanceUid; }
    public void setDicomStudyInstanceUid(String dicomStudyInstanceUid) { this.dicomStudyInstanceUid = dicomStudyInstanceUid; }
    public String getRadiologistReport() { return radiologistReport; }
    public void setRadiologistReport(String radiologistReport) { this.radiologistReport = radiologistReport; }
    public String getRadiologistUsername() { return radiologistUsername; }
    public void setRadiologistUsername(String radiologistUsername) { this.radiologistUsername = radiologistUsername; }
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
    public LocalDateTime getReportGeneratedAt() { return reportGeneratedAt; }
    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) { this.reportGeneratedAt = reportGeneratedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
