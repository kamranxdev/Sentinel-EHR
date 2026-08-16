package com.sentinel.procedure.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ProcedurePerformanceResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private Long procedureOrderId;
    private String performedByName;
    private OffsetDateTime performedAt;
    private String status;
    private String findings;
    private String complications;

    public ProcedurePerformanceResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public Long getProcedureOrderId() { return procedureOrderId; }
    public void setProcedureOrderId(Long procedureOrderId) { this.procedureOrderId = procedureOrderId; }
    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
    public OffsetDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(OffsetDateTime performedAt) { this.performedAt = performedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getComplications() { return complications; }
    public void setComplications(String complications) { this.complications = complications; }
}
