package com.sentinel.identity.dto;

import java.util.UUID;

public class PractitionerSearchCriteria {
    private String query;
    private String specialty;
    private String status;
    private UUID organizationId;

    public PractitionerSearchCriteria() {}

    public PractitionerSearchCriteria(String query, String specialty, String status, UUID organizationId) {
        this.query = query;
        this.specialty = specialty;
        this.status = status;
        this.organizationId = organizationId;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
}
