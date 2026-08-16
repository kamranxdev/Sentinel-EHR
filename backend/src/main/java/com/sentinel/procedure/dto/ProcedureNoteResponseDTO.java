package com.sentinel.procedure.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ProcedureNoteResponseDTO {
    private UUID id;
    private UUID performanceId;
    private String noteType;
    private String content;
    private String createdByUsername;
    private OffsetDateTime createdAt;

    public ProcedureNoteResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPerformanceId() { return performanceId; }
    public void setPerformanceId(UUID performanceId) { this.performanceId = performanceId; }
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCreatedByUsername() { return createdByUsername; }
    public void setCreatedByUsername(String createdByUsername) { this.createdByUsername = createdByUsername; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
