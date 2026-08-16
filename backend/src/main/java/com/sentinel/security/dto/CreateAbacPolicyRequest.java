package com.sentinel.security.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateAbacPolicyRequest {
    @NotBlank(message = "Policy name is required")
    private String name;
    private String description;
    private String subjectRole;
    private String resourceType;
    private String action;
    private String constraintExpression;

    public CreateAbacPolicyRequest() {}

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
}
