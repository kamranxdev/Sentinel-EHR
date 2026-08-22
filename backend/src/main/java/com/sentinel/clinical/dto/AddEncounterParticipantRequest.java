package com.sentinel.clinical.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AddEncounterParticipantRequest {

    @NotNull(message = "Practitioner ID is required")
    private UUID practitionerId;

    private String participantRole = "PRIMARY"; // PRIMARY, ATTENDING, CONSULTANT, ADMITTING, DISCHARGING, NURSE, RESIDENT

    public AddEncounterParticipantRequest() {}

    public AddEncounterParticipantRequest(UUID practitionerId, String participantRole) {
        this.practitionerId = practitionerId;
        this.participantRole = participantRole;
    }

    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }

    public String getParticipantRole() { return participantRole; }
    public void setParticipantRole(String participantRole) { this.participantRole = participantRole; }
}
