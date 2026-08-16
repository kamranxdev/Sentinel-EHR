package com.sentinel.identity.dto;

import java.util.UUID;

public class UserSearchCriteria {
    private String query;
    private String status;
    private String role;
    private UUID organizationId;

    public UserSearchCriteria() {}

    public UserSearchCriteria(String query, String status, String role, UUID organizationId) {
        this.query = query;
        this.status = status;
        this.role = role;
        this.organizationId = organizationId;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
}
