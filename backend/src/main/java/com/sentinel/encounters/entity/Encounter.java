package com.sentinel.encounters.entity;

import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "encounters")
public class Encounter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "attending_provider_id", nullable = false)
    private User attendingProvider;

    @Column(nullable = false)
    private String encounterType = "INPATIENT"; // INPATIENT, OUTPATIENT, EMERGENCY, TELEHEALTH

    @Column(length = 1000)
    private String chiefComplaint;

    @Column(length = 3000)
    private String clinicalNotes;

    @Column(length = 3000)
    private String dischargeSummary;

    // Inpatient Lifecycle State Machine:
    // ADMISSION_REQUESTED -> ADMITTED -> BED_ASSIGNED -> INPATIENT_ACTIVE -> DISCHARGE_PLANNED -> DISCHARGED -> ENCOUNTER_CLOSED
    @Column(nullable = false)
    private String status = "ADMITTED";

    private String admissionType; // EMERGENCY, URGENT, ELECTIVE, INTER_FACILITY, INTRA_FACILITY
    private String admissionSource; // ED, OPD, Transfer, Direct
    private String departmentName; // Cardiology, ICU, Ward A
    private String admissionDiagnosisIcd; // ICD-10 Code
    private Integer acuityScore; // 1-5 Triage EWS Level

    @ManyToOne
    @JoinColumn(name = "assigned_bed_id")
    private Bed assignedBed;

    private LocalDateTime encounterDate = LocalDateTime.now();
    private LocalDateTime admissionTime = LocalDateTime.now();
    private LocalDateTime dischargeTime;

    public Encounter() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public User getAttendingProvider() {
        return attendingProvider;
    }

    public void setAttendingProvider(User attendingProvider) {
        this.attendingProvider = attendingProvider;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getDischargeSummary() {
        return dischargeSummary;
    }

    public void setDischargeSummary(String dischargeSummary) {
        this.dischargeSummary = dischargeSummary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdmissionType() {
        return admissionType;
    }

    public void setAdmissionType(String admissionType) {
        this.admissionType = admissionType;
    }

    public String getAdmissionSource() {
        return admissionSource;
    }

    public void setAdmissionSource(String admissionSource) {
        this.admissionSource = admissionSource;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getAdmissionDiagnosisIcd() {
        return admissionDiagnosisIcd;
    }

    public void setAdmissionDiagnosisIcd(String admissionDiagnosisIcd) {
        this.admissionDiagnosisIcd = admissionDiagnosisIcd;
    }

    public Integer getAcuityScore() {
        return acuityScore;
    }

    public void setAcuityScore(Integer acuityScore) {
        this.acuityScore = acuityScore;
    }

    public Bed getAssignedBed() {
        return assignedBed;
    }

    public void setAssignedBed(Bed assignedBed) {
        this.assignedBed = assignedBed;
    }

    public LocalDateTime getEncounterDate() {
        return encounterDate;
    }

    public void setEncounterDate(LocalDateTime encounterDate) {
        this.encounterDate = encounterDate;
    }

    public LocalDateTime getAdmissionTime() {
        return admissionTime;
    }

    public void setAdmissionTime(LocalDateTime admissionTime) {
        this.admissionTime = admissionTime;
    }

    public LocalDateTime getDischargeTime() {
        return dischargeTime;
    }

    public void setDischargeTime(LocalDateTime dischargeTime) {
        this.dischargeTime = dischargeTime;
    }
}
