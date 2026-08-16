package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.tenancy.entity.Facility;
import com.sentinel.tenancy.entity.Organization;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "patient_organizations", schema = "patient",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"organization_id", "mrn"}),
           @UniqueConstraint(columnNames = {"patient_id", "organization_id"})
       })
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientOrganization {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 100)
    private String mrn;

    @Column(name = "patient_status", nullable = false, length = 30)
    private String patientStatus = "ACTIVE";

    @Column(name = "registered_at", nullable = false)
    private OffsetDateTime registeredAt = OffsetDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_facility_id")
    private Facility primaryFacility;

    public PatientOrganization() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getPatientStatus() { return patientStatus; }
    public void setPatientStatus(String patientStatus) { this.patientStatus = patientStatus; }

    // backward compat
    public String getStatus() { return patientStatus; }
    public void setStatus(String status) { this.patientStatus = status; }

    public OffsetDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(OffsetDateTime registeredAt) { this.registeredAt = registeredAt; }

    public Facility getPrimaryFacility() { return primaryFacility; }
    public void setPrimaryFacility(Facility primaryFacility) { this.primaryFacility = primaryFacility; }
}
