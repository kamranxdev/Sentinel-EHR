package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_document_versions", schema = "clinical",
       uniqueConstraints = @UniqueConstraint(columnNames = {"document_id", "version_number"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClinicalDocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private ClinicalDocument document;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authored_by")
    private User authoredBy;

    @Column(nullable = false)
    private OffsetDateTime authoredAt = OffsetDateTime.now();

    @Column(name = "amendment_reason", columnDefinition = "TEXT")
    private String amendmentReason;

    public ClinicalDocumentVersion() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ClinicalDocument getDocument() { return document; }
    public void setDocument(ClinicalDocument document) { this.document = document; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public User getAuthoredBy() { return authoredBy; }
    public void setAuthoredBy(User authoredBy) { this.authoredBy = authoredBy; }

    public OffsetDateTime getAuthoredAt() { return authoredAt; }
    public void setAuthoredAt(OffsetDateTime authoredAt) { this.authoredAt = authoredAt; }

    public String getAmendmentReason() { return amendmentReason; }
    public void setAmendmentReason(String amendmentReason) { this.amendmentReason = amendmentReason; }
}
