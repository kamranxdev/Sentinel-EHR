package com.sentinel.security.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AbacPolicyResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private String subjectRole;
    private String resourceType;
    private String action;
    private String constraintExpression;
    private Boolean active;
    private OffsetDateTime createdAt;

    public AbacPolicyResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSubjectRole() { return subjectRole; }
    public void setSubjectRole(String subjectRole) { this.subjectRole = subjectRole; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getConstraintExpression() { return constraintExpression; }
    public void setConstraintExpression(String constraintExpression) { this.constraintExpression = constraintExpression; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
