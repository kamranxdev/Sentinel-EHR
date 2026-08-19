package com.sentinel.audit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_events", schema = "audit")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private UUID organizationId;
    private UUID facilityId;
    private UUID userId;
    private UUID patientId;
    private UUID encounterId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String resourceType = "GENERAL";

    private UUID resourceId;
    private String purposeOfUse;
    private String result = "SUCCESS";

    @Column(columnDefinition = "TEXT")
    private String ipAddress = "127.0.0.1";

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column(nullable = false)
    private OffsetDateTime occurredAt = OffsetDateTime.now();

    @Transient
    private String userEmail;

    @Transient
    private String userRole;

    @Transient
    private String entityName;

    @Transient
    private String details;

    public AuditLog() {}

    public AuditLog(String userEmail, String userRole, String action, String entityName, String details) {
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.action = action;
        this.entityName = entityName;
        this.resourceType = entityName != null ? entityName : "GENERAL";
        this.details = details;
    }

    public AuditLog(String userEmail, String userRole, String action, String entityName, String resourceId, String details) {
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.action = action;
        this.entityName = entityName;
        this.resourceType = entityName != null ? entityName : "GENERAL";
        this.details = details;
        try {
            if (resourceId != null) this.resourceId = UUID.fromString(resourceId);
        } catch (Exception ignored) {}
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getFacilityId() { return facilityId; }
    public void setFacilityId(UUID facilityId) { this.facilityId = facilityId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public UUID getResourceId() { return resourceId; }
    public void setResourceId(UUID resourceId) { this.resourceId = resourceId; }

    public String getPurposeOfUse() { return purposeOfUse; }
    public void setPurposeOfUse(String purposeOfUse) { this.purposeOfUse = purposeOfUse; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public OffsetDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(OffsetDateTime occurredAt) { this.occurredAt = occurredAt; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getEmail() { return userEmail; }
    public void setEmail(String email) { this.userEmail = email; }

    public String getUsername() { return userEmail; }
    public void setUsername(String username) { this.userEmail = username; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getEntityName() { return entityName != null ? entityName : resourceType; }
    public void setEntityName(String entityName) {
        this.entityName = entityName;
        this.resourceType = entityName;
    }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
