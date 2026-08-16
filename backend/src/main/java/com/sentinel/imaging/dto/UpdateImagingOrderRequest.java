package com.sentinel.imaging.dto;

import java.time.LocalDateTime;

public class UpdateImagingOrderRequest {
    private String status;
    private String dicomStudyInstanceUid;
    private String radiologistReport;
    private LocalDateTime scheduledAt;
    private LocalDateTime performedAt;

    public UpdateImagingOrderRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDicomStudyInstanceUid() { return dicomStudyInstanceUid; }
    public void setDicomStudyInstanceUid(String dicomStudyInstanceUid) { this.dicomStudyInstanceUid = dicomStudyInstanceUid; }
    public String getRadiologistReport() { return radiologistReport; }
    public void setRadiologistReport(String radiologistReport) { this.radiologistReport = radiologistReport; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
}
