package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "encounter_participants", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EncounterParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "practitioner_id", nullable = false)
    private User practitioner;

    @Column(name = "participant_role", nullable = false, length = 50)
    private String participantRole = "PRIMARY"; // PRIMARY, ATTENDING, CONSULTANT, ADMITTING, DISCHARGING, NURSE, RESIDENT

    @Column(name = "period_start", nullable = false)
    private OffsetDateTime periodStart = OffsetDateTime.now();

    @Column(name = "period_end")
    private OffsetDateTime periodEnd;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public EncounterParticipant() {}

    public EncounterParticipant(Organization organization, Encounter encounter, User practitioner, String participantRole) {
        this.organization = organization;
        this.encounter = encounter;
        this.practitioner = practitioner;
        this.participantRole = participantRole;
        this.periodStart = OffsetDateTime.now();
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public User getPractitioner() { return practitioner; }
    public void setPractitioner(User practitioner) { this.practitioner = practitioner; }

    public String getParticipantRole() { return participantRole; }
    public void setParticipantRole(String participantRole) { this.participantRole = participantRole; }

    public OffsetDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(OffsetDateTime periodStart) { this.periodStart = periodStart; }

    public OffsetDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(OffsetDateTime periodEnd) { this.periodEnd = periodEnd; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
