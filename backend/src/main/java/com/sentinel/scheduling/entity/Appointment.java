package com.sentinel.scheduling.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.identity.entity.User;
import com.sentinel.clinical.entity.Vitals;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", schema = "scheduling")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_id")
    private User practitioner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false, length = 30)
    private String schedulingMode = "SPECIFIC_DOCTOR";

    @Column(length = 100)
    private String specialtyCode;

    @Column(length = 30)
    private String encounterType = "OUTPATIENT";

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(nullable = false)
    private OffsetDateTime startsAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime endsAt = OffsetDateTime.now().plusMinutes(30);

    @Column(nullable = false, length = 30)
    private String status = "SCHEDULED";

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private OffsetDateTime checkedInAt;
    private OffsetDateTime arrivedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime noShowAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Transient
    private Vitals vitals;

    public Appointment() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getPractitioner() { return practitioner; }
    public void setPractitioner(User practitioner) { this.practitioner = practitioner; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getSchedulingMode() { return schedulingMode; }
    public void setSchedulingMode(String schedulingMode) { this.schedulingMode = schedulingMode; }

    public String getSpecialtyCode() { return specialtyCode; }
    public void setSpecialtyCode(String specialtyCode) { this.specialtyCode = specialtyCode; }

    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }

    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }

    public OffsetDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(OffsetDateTime startsAt) { this.startsAt = startsAt; }

    public OffsetDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(OffsetDateTime endsAt) { this.endsAt = endsAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public OffsetDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(OffsetDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public OffsetDateTime getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(OffsetDateTime arrivedAt) { this.arrivedAt = arrivedAt; }

    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }

    public OffsetDateTime getNoShowAt() { return noShowAt; }
    public void setNoShowAt(OffsetDateTime noShowAt) { this.noShowAt = noShowAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Vitals getVitals() { return vitals; }
    public void setVitals(Vitals vitals) { this.vitals = vitals; }

    // Legacy getter helpers
    public User getDoctor() { return practitioner != null ? practitioner : createdBy; }
    public void setDoctor(User doctor) {
        this.practitioner = doctor;
        if (this.createdBy == null) {
            this.createdBy = doctor;
        }
    }
}
