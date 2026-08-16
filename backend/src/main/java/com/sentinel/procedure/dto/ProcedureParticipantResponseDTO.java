package com.sentinel.procedure.dto;

import java.util.UUID;

public class ProcedureParticipantResponseDTO {
    private UUID id;
    private UUID performanceId;
    private UUID practitionerId;
    private String practitionerName;
    private String role;

    public ProcedureParticipantResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPerformanceId() { return performanceId; }
    public void setPerformanceId(UUID performanceId) { this.performanceId = performanceId; }
    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public String getPractitionerName() { return practitionerName; }
    public void setPractitionerName(String practitionerName) { this.practitionerName = practitionerName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
