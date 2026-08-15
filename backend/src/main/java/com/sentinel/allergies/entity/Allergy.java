package com.sentinel.allergies.entity;

import com.sentinel.patients.entity.Patient;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "allergies")
public class Allergy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String allergenName;

    private String allergenCode; // SNOMED-CT or RxNorm code

    @Column(nullable = false)
    private String category; // DRUG, FOOD, ENVIRONMENTAL, OTHER

    @Column(nullable = false)
    private String severity; // MILD, MODERATE, SEVERE, LIFE_THREATENING

    @Column(length = 1000)
    private String reactionDescription;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE, RESOLVED

    @ManyToOne
    @JoinColumn(name = "recorded_by_id")
    private User recordedBy;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public Allergy() {}

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

    public String getAllergenName() {
        return allergenName;
    }

    public void setAllergenName(String allergenName) {
        this.allergenName = allergenName;
    }

    public String getAllergenCode() {
        return allergenCode;
    }

    public void setAllergenCode(String allergenCode) {
        this.allergenCode = allergenCode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getReactionDescription() {
        return reactionDescription;
    }

    public void setReactionDescription(String reactionDescription) {
        this.reactionDescription = reactionDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(User recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public org.hl7.fhir.r4.model.AllergyIntolerance toFhirResource() {
        org.hl7.fhir.r4.model.AllergyIntolerance allergy = new org.hl7.fhir.r4.model.AllergyIntolerance();
        if (id != null) {
            allergy.setId("AllergyIntolerance/" + id);
        }

        // Clinical status
        org.hl7.fhir.r4.model.CodeableConcept clinicalStatus = new org.hl7.fhir.r4.model.CodeableConcept();
        String statusCode = "RESOLVED".equalsIgnoreCase(status) ? "resolved" : "active";
        clinicalStatus.addCoding(new org.hl7.fhir.r4.model.Coding(
                "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                statusCode,
                statusCode
        ));
        allergy.setClinicalStatus(clinicalStatus);

        // Criticality / Severity
        if ("SEVERE".equalsIgnoreCase(severity) || "LIFE_THREATENING".equalsIgnoreCase(severity)) {
            allergy.setCriticality(org.hl7.fhir.r4.model.AllergyIntolerance.AllergyIntoleranceCriticality.HIGH);
        } else {
            allergy.setCriticality(org.hl7.fhir.r4.model.AllergyIntolerance.AllergyIntoleranceCriticality.LOW);
        }

        // Category
        if ("DRUG".equalsIgnoreCase(category)) {
            allergy.addCategory(org.hl7.fhir.r4.model.AllergyIntolerance.AllergyIntoleranceCategory.MEDICATION);
        } else if ("FOOD".equalsIgnoreCase(category)) {
            allergy.addCategory(org.hl7.fhir.r4.model.AllergyIntolerance.AllergyIntoleranceCategory.FOOD);
        } else if ("ENVIRONMENTAL".equalsIgnoreCase(category)) {
            allergy.addCategory(org.hl7.fhir.r4.model.AllergyIntolerance.AllergyIntoleranceCategory.ENVIRONMENT);
        }

        // Code
        org.hl7.fhir.r4.model.CodeableConcept codeConcept = new org.hl7.fhir.r4.model.CodeableConcept();
        if (allergenName != null) {
            codeConcept.setText(allergenName);
        }
        if (allergenCode != null && !allergenCode.isBlank()) {
            codeConcept.addCoding(new org.hl7.fhir.r4.model.Coding(
                    "http://snomed.info/sct",
                    allergenCode,
                    allergenName
            ));
        }
        allergy.setCode(codeConcept);

        if (patient != null && patient.getId() != null) {
            allergy.setPatient(new org.hl7.fhir.r4.model.Reference("Patient/" + patient.getId()));
        }

        if (recordedBy != null && recordedBy.getId() != null) {
            allergy.setRecorder(new org.hl7.fhir.r4.model.Reference("Practitioner/" + recordedBy.getId()));
        }

        if (reactionDescription != null && !reactionDescription.isBlank()) {
            org.hl7.fhir.r4.model.AllergyIntolerance.AllergyIntoleranceReactionComponent rx = allergy.addReaction();
            rx.setDescription(reactionDescription);
        }

        return allergy;
    }
}

