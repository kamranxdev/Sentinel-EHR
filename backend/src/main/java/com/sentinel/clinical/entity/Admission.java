package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.patient.entity.Patient;
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

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String admissionSource;
    private String admitReason;

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

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }

    public String getAdmitReason() { return admitReason; }
    public void setAdmitReason(String admitReason) { this.admitReason = admitReason; }

    public OffsetDateTime getAdmittedAt() { return admittedAt; }
    public void setAdmittedAt(OffsetDateTime admittedAt) { this.admittedAt = admittedAt; }

    public OffsetDateTime getDischargedAt() { return dischargedAt; }
    public void setDischargedAt(OffsetDateTime dischargedAt) { this.dischargedAt = dischargedAt; }

    public String getDischargeDisposition() { return dischargeDisposition; }
    public void setDischargeDisposition(String dischargeDisposition) { this.dischargeDisposition = dischargeDisposition; }

    public Integer getLengthOfStayDays() { return lengthOfStayDays; }
    public void setLengthOfStayDays(Integer lengthOfStayDays) { this.lengthOfStayDays = lengthOfStayDays; }
}
