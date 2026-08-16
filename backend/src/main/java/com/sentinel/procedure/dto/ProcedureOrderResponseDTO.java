package com.sentinel.procedure.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProcedureOrderResponseDTO {
    private Long id;
    private UUID patientId;
    private UUID encounterId;
    private String orderingProviderUsername;
    private String procedureName;
    private String snomedCode;
    private String cptCode;
    private String status;
    private String operativeReport;
    private String proceduralistUsername;
    private LocalDateTime orderedAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime performedAt;
    private LocalDateTime documentedAt;

    public ProcedureOrderResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getOrderingProviderUsername() { return orderingProviderUsername; }
    public void setOrderingProviderUsername(String orderingProviderUsername) { this.orderingProviderUsername = orderingProviderUsername; }
    public String getProcedureName() { return procedureName; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }
    public String getSnomedCode() { return snomedCode; }
    public void setSnomedCode(String snomedCode) { this.snomedCode = snomedCode; }
    public String getCptCode() { return cptCode; }
    public void setCptCode(String cptCode) { this.cptCode = cptCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOperativeReport() { return operativeReport; }
    public void setOperativeReport(String operativeReport) { this.operativeReport = operativeReport; }
    public String getProceduralistUsername() { return proceduralistUsername; }
    public void setProceduralistUsername(String proceduralistUsername) { this.proceduralistUsername = proceduralistUsername; }
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
    public LocalDateTime getDocumentedAt() { return documentedAt; }
    public void setDocumentedAt(LocalDateTime documentedAt) { this.documentedAt = documentedAt; }
}
