package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class EncounterParticipantResponseDTO {
    private UUID id;
    private UUID encounterId;
    private UUID practitionerId;
    private String practitionerName;
    private String practitionerEmail;
    private String participantRole;
    private OffsetDateTime periodStart;
    private OffsetDateTime periodEnd;

    public EncounterParticipantResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }

    public UUID getPractitionerId() { return practitionerId; }
    public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }

    public String getPractitionerName() { return practitionerName; }
    public void setPractitionerName(String practitionerName) { this.practitionerName = practitionerName; }

    public String getPractitionerEmail() { return practitionerEmail; }
    public void setPractitionerEmail(String practitionerEmail) { this.practitionerEmail = practitionerEmail; }

    public String getParticipantRole() { return participantRole; }
    public void setParticipantRole(String participantRole) { this.participantRole = participantRole; }

    public OffsetDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(OffsetDateTime periodStart) { this.periodStart = periodStart; }

    public OffsetDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(OffsetDateTime periodEnd) { this.periodEnd = periodEnd; }
}
