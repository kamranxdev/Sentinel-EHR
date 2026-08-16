package com.sentinel.documents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateDocumentLinkRequest {
    @NotBlank(message = "Entity type is required")
    private String entityType;
    @NotNull(message = "Entity ID is required")
    private UUID entityId;

    public CreateDocumentLinkRequest() {}

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
}
