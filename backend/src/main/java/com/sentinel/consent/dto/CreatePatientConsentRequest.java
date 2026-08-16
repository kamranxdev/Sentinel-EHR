package com.sentinel.consent.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreatePatientConsentRequest {
    private UUID organizationId;
    @NotNull(message = "Consent type ID is required")
    private UUID consentTypeId;
    private String scope;
    private String notes;

    public CreatePatientConsentRequest() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getConsentTypeId() { return consentTypeId; }
    public void setConsentTypeId(UUID consentTypeId) { this.consentTypeId = consentTypeId; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
