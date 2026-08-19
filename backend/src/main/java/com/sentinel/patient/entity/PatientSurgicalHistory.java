package com.sentinel.patient.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_surgical_history", schema = "patient")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PatientSurgicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "procedure_name", nullable = false, length = 255)
    private String procedureName;

    @Column(name = "procedure_code", length = 100)
    private String procedureCode;

    @Column(name = "performed_at")
    private LocalDate performedAt;

    @Column(name = "hospital_name", length = 255)
    private String hospitalName;

    @Column(name = "surgeon_name", length = 255)
    private String surgeonName;

    @Column(columnDefinition = "TEXT")
    private String complications;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PatientSurgicalHistory() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getProcedureName() { return procedureName; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }

    public String getProcedureCode() { return procedureCode; }
    public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

    public LocalDate getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDate performedAt) { this.performedAt = performedAt; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getSurgeonName() { return surgeonName; }
    public void setSurgeonName(String surgeonName) { this.surgeonName = surgeonName; }

    public String getComplications() { return complications; }
    public void setComplications(String complications) { this.complications = complications; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
