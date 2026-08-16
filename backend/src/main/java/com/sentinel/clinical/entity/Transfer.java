package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.User;
import com.sentinel.tenancy.entity.Bed;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.entity.Ward;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transfers", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_department_id")
    private Department fromDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_ward_id")
    private Ward fromWard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_bed_id")
    private Bed fromBed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_department_id")
    private Department toDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_ward_id")
    private Ward toWard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_bed_id")
    private Bed toBed;

    @Column(name = "transferred_at", nullable = false)
    private OffsetDateTime transferredAt;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transferred_by")
    private User transferredBy;

    public Transfer() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Department getFromDepartment() { return fromDepartment; }
    public void setFromDepartment(Department fromDepartment) { this.fromDepartment = fromDepartment; }

    public Ward getFromWard() { return fromWard; }
    public void setFromWard(Ward fromWard) { this.fromWard = fromWard; }

    public Bed getFromBed() { return fromBed; }
    public void setFromBed(Bed fromBed) { this.fromBed = fromBed; }

    public Department getToDepartment() { return toDepartment; }
    public void setToDepartment(Department toDepartment) { this.toDepartment = toDepartment; }

    public Ward getToWard() { return toWard; }
    public void setToWard(Ward toWard) { this.toWard = toWard; }

    public Bed getToBed() { return toBed; }
    public void setToBed(Bed toBed) { this.toBed = toBed; }

    public OffsetDateTime getTransferredAt() { return transferredAt; }
    public void setTransferredAt(OffsetDateTime transferredAt) { this.transferredAt = transferredAt; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public User getTransferredBy() { return transferredBy; }
    public void setTransferredBy(User transferredBy) { this.transferredBy = transferredBy; }
}
