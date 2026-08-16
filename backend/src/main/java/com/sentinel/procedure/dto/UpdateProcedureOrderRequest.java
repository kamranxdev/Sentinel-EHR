package com.sentinel.procedure.dto;

import java.time.LocalDateTime;

public class UpdateProcedureOrderRequest {
    private String status;
    private String operativeReport;
    private LocalDateTime scheduledAt;
    private LocalDateTime performedAt;

    public UpdateProcedureOrderRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOperativeReport() { return operativeReport; }
    public void setOperativeReport(String operativeReport) { this.operativeReport = operativeReport; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
}
