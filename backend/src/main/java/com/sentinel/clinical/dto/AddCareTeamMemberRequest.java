package com.sentinel.clinical.dto;

import java.util.UUID;

public class AddCareTeamMemberRequest {
    private UUID practitionerId;
    private UUID userId;
    private String role;

    public AddCareTeamMemberRequest() {}

    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
