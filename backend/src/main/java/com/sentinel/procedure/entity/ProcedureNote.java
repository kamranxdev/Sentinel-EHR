package com.sentinel.procedure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "procedure_notes", schema = "procedures")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProcedureNote {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performance_id", nullable = false)
    private ProcedurePerformance performance;

    @Column(name = "note_type", length = 50)
    private String noteType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ProcedureNote() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ProcedurePerformance getPerformance() { return performance; }
    public void setPerformance(ProcedurePerformance performance) { this.performance = performance; }

    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
