package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "encounters", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String encounterNumber;

    @Column(nullable = false, length = 50)
    private String encounterType = "INPATIENT";

    @Column(nullable = false, length = 30)
    private String status = "PLANNED";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attending_practitioner_id")
    private User attendingPractitioner;

    @Column(name = "appointment_id")
    private UUID appointmentId;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(columnDefinition = "TEXT")
    private String reasonForVisit;

    private String admissionSource;
    private String admissionType;
    private String acuity;

    @Column(nullable = false)
    private OffsetDateTime startedAt = OffsetDateTime.now();

    private OffsetDateTime endedAt;
    private String disposition;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Encounter() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getEncounterNumber() { return encounterNumber; }
    public void setEncounterNumber(String encounterNumber) { this.encounterNumber = encounterNumber; }

    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getAttendingPractitioner() { return attendingPractitioner; }
    public void setAttendingPractitioner(User attendingPractitioner) { this.attendingPractitioner = attendingPractitioner; }

    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }

    public String getAdmissionType() { return admissionType; }
    public void setAdmissionType(String admissionType) { this.admissionType = admissionType; }

    public String getAcuity() { return acuity; }
    public void setAcuity(String acuity) { this.acuity = acuity; }

    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }

    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }

    public String getDisposition() { return disposition; }
    public void setDisposition(String disposition) { this.disposition = disposition; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Legacy getter helper
    public User getAttendingProvider() {
        return attendingPractitioner != null ? attendingPractitioner : createdBy;
    }

    public void setAttendingProvider(User attendingProvider) {
        this.attendingPractitioner = attendingProvider;
        if (this.createdBy == null) {
            this.createdBy = attendingProvider;
        }
    }
}
