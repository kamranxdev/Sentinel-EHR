package com.sentinel.tenancy.dto;

public class OrganizationSearchCriteria {
    private String query;
    private String status;
    private String organizationType;

    public OrganizationSearchCriteria() {}

    public OrganizationSearchCriteria(String query, String status, String organizationType) {
        this.query = query;
        this.status = status;
        this.organizationType = organizationType;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOrganizationType() { return organizationType; }
    public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }
}
