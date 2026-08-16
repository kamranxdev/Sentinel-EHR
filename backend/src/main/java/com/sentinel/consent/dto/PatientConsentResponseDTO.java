package com.sentinel.consent.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PatientConsentResponseDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID organizationId;
    private UUID consentTypeId;
    private String consentTypeCode;
    private String consentTypeName;
    private String status;
    private OffsetDateTime grantedAt;
    private OffsetDateTime revokedAt;
    private String grantedByUsername;
    private String scope;
    private String notes;

    public PatientConsentResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getConsentTypeId() { return consentTypeId; }
    public void setConsentTypeId(UUID consentTypeId) { this.consentTypeId = consentTypeId; }
    public String getConsentTypeCode() { return consentTypeCode; }
    public void setConsentTypeCode(String consentTypeCode) { this.consentTypeCode = consentTypeCode; }
    public String getConsentTypeName() { return consentTypeName; }
    public void setConsentTypeName(String consentTypeName) { this.consentTypeName = consentTypeName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getGrantedAt() { return grantedAt; }
    public void setGrantedAt(OffsetDateTime grantedAt) { this.grantedAt = grantedAt; }
    public OffsetDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(OffsetDateTime revokedAt) { this.revokedAt = revokedAt; }
    public String getGrantedByUsername() { return grantedByUsername; }
    public void setGrantedByUsername(String grantedByUsername) { this.grantedByUsername = grantedByUsername; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
