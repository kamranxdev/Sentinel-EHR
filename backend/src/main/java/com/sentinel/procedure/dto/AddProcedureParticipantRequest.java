package com.sentinel.procedure.dto;

import java.util.UUID;

public class AddProcedureParticipantRequest {
    private UUID practitionerId;
    private String role;

    public AddProcedureParticipantRequest() {}

    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
