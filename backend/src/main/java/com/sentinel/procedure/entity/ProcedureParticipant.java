package com.sentinel.procedure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.Practitioner;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "procedure_participants", schema = "procedures")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProcedureParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performance_id", nullable = false)
    private ProcedurePerformance performance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_id")
    private Practitioner practitioner;

    @Column(length = 100)
    private String role;

    public ProcedureParticipant() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ProcedurePerformance getPerformance() { return performance; }
    public void setPerformance(ProcedurePerformance performance) { this.performance = performance; }

    public Practitioner getPractitioner() { return practitioner; }
    public void setPractitioner(Practitioner practitioner) { this.practitioner = practitioner; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
