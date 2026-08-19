package com.sentinel.clinical.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProblemListResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID organizationId;
    private String codeSystem;
    private String code;
    private String problemName;
    private String status;
    private LocalDate onsetDate;
    private LocalDate resolvedDate;
    private String notes;
    private String recordedByEmail;
    private OffsetDateTime recordedAt;

    public ProblemListResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getCodeSystem() { return codeSystem; }
    public void setCodeSystem(String codeSystem) { this.codeSystem = codeSystem; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getProblemName() { return problemName; }
    public void setProblemName(String problemName) { this.problemName = problemName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getOnsetDate() { return onsetDate; }
    public void setOnsetDate(LocalDate onsetDate) { this.onsetDate = onsetDate; }
    public LocalDate getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDate resolvedDate) { this.resolvedDate = resolvedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRecordedByEmail() { return recordedByEmail; }
    public void setRecordedByEmail(String recordedByEmail) { this.recordedByEmail = recordedByEmail; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
