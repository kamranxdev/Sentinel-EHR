package com.sentinel.patient.dto;

import java.util.UUID;

public class PatientSearchCriteria {
    private String query;
    private String mrn;
    private String phone;
    private String status;
    private UUID organizationId;

    public PatientSearchCriteria() {}

    public PatientSearchCriteria(String query, String mrn, String phone, String status, UUID organizationId) {
        this.query = query;
        this.mrn = mrn;
        this.phone = phone;
        this.status = status;
        this.organizationId = organizationId;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
}
