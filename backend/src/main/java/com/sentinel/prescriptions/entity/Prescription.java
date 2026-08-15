package com.sentinel.prescriptions.entity;

import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
public class Prescription {
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
    private String medicationName;

    private String rxNormCode;

    @Column(nullable = false)
    private String dosage; // e.g. 500mg

    private String route; // Oral, IV, Subcutaneous, Topical, Inhalation

    @Column(nullable = false)
    private String frequency; // e.g. twice daily after meals

    private Integer durationDays;

    private Integer refills = 0;

    @Column(length = 1000)
    private String instructions;

    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED

    private LocalDateTime prescribedAt = LocalDateTime.now();

    public Prescription() {}

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

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getRxNormCode() {
        return rxNormCode;
    }

    public void setRxNormCode(String rxNormCode) {
        this.rxNormCode = rxNormCode;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getRefills() {
        return refills;
    }

    public void setRefills(Integer refills) {
        this.refills = refills;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getPrescribedAt() {
        return prescribedAt;
    }

    public void setPrescribedAt(LocalDateTime prescribedAt) {
        this.prescribedAt = prescribedAt;
    }

    public org.hl7.fhir.r4.model.MedicationRequest toFhirResource() {
        org.hl7.fhir.r4.model.MedicationRequest medReq = new org.hl7.fhir.r4.model.MedicationRequest();
        if (id != null) {
            medReq.setId("MedicationRequest/" + id);
        }

        medReq.setIntent(org.hl7.fhir.r4.model.MedicationRequest.MedicationRequestIntent.ORDER);

        if ("COMPLETED".equalsIgnoreCase(status)) {
            medReq.setStatus(org.hl7.fhir.r4.model.MedicationRequest.MedicationRequestStatus.COMPLETED);
        } else if ("CANCELLED".equalsIgnoreCase(status) || "STOPPED".equalsIgnoreCase(status)) {
            medReq.setStatus(org.hl7.fhir.r4.model.MedicationRequest.MedicationRequestStatus.STOPPED);
        } else {
            medReq.setStatus(org.hl7.fhir.r4.model.MedicationRequest.MedicationRequestStatus.ACTIVE);
        }

        org.hl7.fhir.r4.model.CodeableConcept medConcept = new org.hl7.fhir.r4.model.CodeableConcept();
        if (medicationName != null) {
            medConcept.setText(medicationName);
        }
        if (rxNormCode != null && !rxNormCode.isBlank()) {
            medConcept.addCoding(new org.hl7.fhir.r4.model.Coding(
                    "http://www.nlm.nih.gov/research/umls/rxnorm",
                    rxNormCode,
                    medicationName
            ));
        }
        medReq.setMedication(medConcept);

        if (patient != null && patient.getId() != null) {
            medReq.setSubject(new org.hl7.fhir.r4.model.Reference("Patient/" + patient.getId()));
        }

        if (doctor != null && doctor.getId() != null) {
            medReq.setRequester(new org.hl7.fhir.r4.model.Reference("Practitioner/" + doctor.getId()));
        }

        org.hl7.fhir.r4.model.Dosage dosageComp = medReq.addDosageInstruction();
        if (instructions != null && !instructions.isBlank()) {
            dosageComp.setText(instructions);
        } else if (dosage != null) {
            dosageComp.setText(dosage + " - " + (frequency != null ? frequency : ""));
        }

        if (prescribedAt != null) {
            medReq.setAuthoredOn(java.sql.Timestamp.valueOf(prescribedAt));
        }

        return medReq;
    }
}

