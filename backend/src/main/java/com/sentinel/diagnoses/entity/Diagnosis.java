package com.sentinel.diagnoses.entity;

import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "diagnoses")
public class Diagnosis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false)
    private String conditionName;

    private String icdCode; // ICD-10 Code e.g. E11.9
    private String snomedCode; // SNOMED CT Code e.g. 44054006

    private LocalDate onsetDate;

    private String status = "ACTIVE"; // ACTIVE, RESOLVED, CHRONIC

    @Column(length = 2000)
    private String notes;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public Diagnosis() {}

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

    public User getDoctor() {
        return doctor;
    }

    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }

    public String getConditionName() {
        return conditionName;
    }

    public String getDiagnosisName() {
        return conditionName;
    }

    public void setConditionName(String conditionName) {
        this.conditionName = conditionName;
    }

    public String getIcdCode() {
        return icdCode;
    }

    public String getIcd10Code() {
        return icdCode;
    }

    public void setIcdCode(String icdCode) {
        this.icdCode = icdCode;
    }

    public String getSnomedCode() {
        return snomedCode;
    }

    public void setSnomedCode(String snomedCode) {
        this.snomedCode = snomedCode;
    }

    public LocalDate getOnsetDate() {
        return onsetDate;
    }

    public void setOnsetDate(LocalDate onsetDate) {
        this.onsetDate = onsetDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public org.hl7.fhir.r4.model.Condition toFhirResource() {
        org.hl7.fhir.r4.model.Condition fhirCondition = new org.hl7.fhir.r4.model.Condition();
        if (id != null) {
            fhirCondition.setId("Condition/" + id);
        }

        // Clinical status
        org.hl7.fhir.r4.model.CodeableConcept clinicalStatus = new org.hl7.fhir.r4.model.CodeableConcept();
        String statusCode = "RESOLVED".equalsIgnoreCase(status) ? "resolved" : "active";
        clinicalStatus.addCoding(new org.hl7.fhir.r4.model.Coding(
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
                statusCode,
                statusCode
        ));
        fhirCondition.setClinicalStatus(clinicalStatus);

        // Code (SNOMED CT + ICD-10)
        org.hl7.fhir.r4.model.CodeableConcept codeConcept = new org.hl7.fhir.r4.model.CodeableConcept();
        if (conditionName != null) {
            codeConcept.setText(conditionName);
        }
        if (snomedCode != null && !snomedCode.isBlank()) {
            codeConcept.addCoding(new org.hl7.fhir.r4.model.Coding(
                    "http://snomed.info/sct",
                    snomedCode,
                    conditionName
            ));
        }
        if (icdCode != null && !icdCode.isBlank()) {
            codeConcept.addCoding(new org.hl7.fhir.r4.model.Coding(
                    "http://hl7.org/fhir/sid/icd-10",
                    icdCode,
                    conditionName
            ));
        }
        fhirCondition.setCode(codeConcept);

        if (patient != null && patient.getId() != null) {
            fhirCondition.setSubject(new org.hl7.fhir.r4.model.Reference("Patient/" + patient.getId()));
        }

        if (doctor != null && doctor.getId() != null) {
            fhirCondition.setRecorder(new org.hl7.fhir.r4.model.Reference("Practitioner/" + doctor.getId()));
        }

        if (onsetDate != null) {
            fhirCondition.setOnset(new org.hl7.fhir.r4.model.DateTimeType(java.sql.Date.valueOf(onsetDate)));
        }

        if (recordedAt != null) {
            fhirCondition.setRecordedDate(java.sql.Timestamp.valueOf(recordedAt));
        }

        return fhirCondition;
    }
}

