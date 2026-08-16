package com.sentinel.documents.dto;

import java.util.UUID;

public class DocumentLinkResponseDTO {
    private UUID id;
    private UUID documentId;
    private String entityType;
    private UUID entityId;

    public DocumentLinkResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
}
