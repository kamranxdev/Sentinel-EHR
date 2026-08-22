package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import com.sentinel.patient.entity.Patient;
import com.sentinel.tenancy.entity.Department;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "admissions", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter; // Inpatient encounter

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_encounter_id")
    private Encounter sourceEncounter; // Source encounter (e.g. Emergency or Outpatient)

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admitting_practitioner_id")
    private User admittingPractitioner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admitting_department_id")
    private Department admittingDepartment;

    @Column(name = "admission_type", length = 50)
    private String admissionType = "EMERGENCY"; // EMERGENCY, ELECTIVE, URGENT, TRANSFER

    private String admissionSource;
    private String admitReason;

    @Column(length = 30)
    private String status = "ADMITTED"; // REQUESTED, ACCEPTED, ADMITTED, DISCHARGED, CANCELLED

    @Column(nullable = false)
    private OffsetDateTime admittedAt = OffsetDateTime.now();

    private OffsetDateTime dischargedAt;

    @Column(length = 100)
    private String dischargeDisposition;

    private Integer lengthOfStayDays;

    public Admission() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Encounter getEncounter() { return encounter; }
    public void setEncounter(Encounter encounter) { this.encounter = encounter; }

    public Encounter getSourceEncounter() { return sourceEncounter; }
    public void setSourceEncounter(Encounter sourceEncounter) { this.sourceEncounter = sourceEncounter; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public User getAdmittingPractitioner() { return admittingPractitioner; }
    public void setAdmittingPractitioner(User admittingPractitioner) { this.admittingPractitioner = admittingPractitioner; }

    public Department getAdmittingDepartment() { return admittingDepartment; }
    public void setAdmittingDepartment(Department admittingDepartment) { this.admittingDepartment = admittingDepartment; }

    public String getAdmissionType() { return admissionType; }
    public void setAdmissionType(String admissionType) { this.admissionType = admissionType; }

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }

    public String getAdmitReason() { return admitReason; }
    public void setAdmitReason(String admitReason) { this.admitReason = admitReason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getAdmittedAt() { return admittedAt; }
    public void setAdmittedAt(OffsetDateTime admittedAt) { this.admittedAt = admittedAt; }

    public OffsetDateTime getDischargedAt() { return dischargedAt; }
    public void setDischargedAt(OffsetDateTime dischargedAt) { this.dischargedAt = dischargedAt; }

    public String getDischargeDisposition() { return dischargeDisposition; }
    public void setDischargeDisposition(String dischargeDisposition) { this.dischargeDisposition = dischargeDisposition; }

    public Integer getLengthOfStayDays() { return lengthOfStayDays; }
    public void setLengthOfStayDays(Integer lengthOfStayDays) { this.lengthOfStayDays = lengthOfStayDays; }
}
