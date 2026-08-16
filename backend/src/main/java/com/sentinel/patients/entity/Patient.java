package com.sentinel.patients.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String patientCode; // MRN

    private String abhaId;
    private String nationalId;

    @Column(nullable = false)
    private String fullName;

    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    private String phone;
    private String email;
    private String address;
    private String pinCode;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "emergency_contact_id")
    private EmergencyContact emergencyContact;

    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    private String coveragePlan;
    
    private String department; // e.g. "Cardiovascular Medicine", "Emergency & Acute Care"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id")
    private com.sentinel.organization.entity.Organization organization;

    @Column(length = 1000)
    private String medicalAlerts; // Allergies, chronic conditions summary

    private String dietaryHabits; // e.g. "Low Sodium, Gluten-Free, Vegetarian"
    private String smokingStatus; // "NEVER", "FORMER", "CURRENT_LIGHT", "CURRENT_HEAVY"
    private String alcoholConsumption; // "NONE", "OCCASIONAL", "MODERATE", "HEAVY"
    private String exerciseRoutine; // "SEDENTARY", "MODERATE", "ACTIVE"
    private String foodAllergies; // e.g. "Peanuts, Shellfish, Lactose"

    @Column(length = 2000)
    private String pastMedicalHistory; // Previous illnesses, chronic conditions
    
    @Column(length = 2000)
    private String seriousConditions; // High severity conditions, ICU stays, major risks

    @Column(length = 2000)
    private String surgeriesAndProcedures; // Past operations & procedures

    @Column(length = 2000)
    private String familyMedicalHistory; // Hereditary risks

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user; // Linked user account if patient registers

    private LocalDateTime createdAt = LocalDateTime.now();

    public Patient() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public String getAbhaId() {
        return abhaId;
    }

    public void setAbhaId(String abhaId) {
        this.abhaId = abhaId;
    }

    public String getNationalId() {
        return nationalId;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }

    public EmergencyContact getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(EmergencyContact emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public String getInsurancePolicyNumber() {
        return insurancePolicyNumber;
    }

    public void setInsurancePolicyNumber(String insurancePolicyNumber) {
        this.insurancePolicyNumber = insurancePolicyNumber;
    }

    public String getInsuranceGroupNumber() {
        return insuranceGroupNumber;
    }

    public void setInsuranceGroupNumber(String insuranceGroupNumber) {
        this.insuranceGroupNumber = insuranceGroupNumber;
    }

    public String getCoveragePlan() {
        return coveragePlan;
    }

    public void setCoveragePlan(String coveragePlan) {
        this.coveragePlan = coveragePlan;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getMedicalAlerts() {
        return medicalAlerts;
    }

    public void setMedicalAlerts(String medicalAlerts) {
        this.medicalAlerts = medicalAlerts;
    }

    public String getDietaryHabits() {
        return dietaryHabits;
    }

    public void setDietaryHabits(String dietaryHabits) {
        this.dietaryHabits = dietaryHabits;
    }

    public String getSmokingStatus() {
        return smokingStatus;
    }

    public void setSmokingStatus(String smokingStatus) {
        this.smokingStatus = smokingStatus;
    }

    public String getAlcoholConsumption() {
        return alcoholConsumption;
    }

    public void setAlcoholConsumption(String alcoholConsumption) {
        this.alcoholConsumption = alcoholConsumption;
    }

    public String getExerciseRoutine() {
        return exerciseRoutine;
    }

    public void setExerciseRoutine(String exerciseRoutine) {
        this.exerciseRoutine = exerciseRoutine;
    }

    public String getFoodAllergies() {
        return foodAllergies;
    }

    public void setFoodAllergies(String foodAllergies) {
        this.foodAllergies = foodAllergies;
    }

    public String getPastMedicalHistory() {
        return pastMedicalHistory;
    }

    public void setPastMedicalHistory(String pastMedicalHistory) {
        this.pastMedicalHistory = pastMedicalHistory;
    }

    public String getSeriousConditions() {
        return seriousConditions;
    }

    public void setSeriousConditions(String seriousConditions) {
        this.seriousConditions = seriousConditions;
    }

    public String getSurgeriesAndProcedures() {
        return surgeriesAndProcedures;
    }

    public void setSurgeriesAndProcedures(String surgeriesAndProcedures) {
        this.surgeriesAndProcedures = surgeriesAndProcedures;
    }

    public String getFamilyMedicalHistory() {
        return familyMedicalHistory;
    }

    public void setFamilyMedicalHistory(String familyMedicalHistory) {
        this.familyMedicalHistory = familyMedicalHistory;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public org.hl7.fhir.r4.model.Patient toFhirResource() {
        org.hl7.fhir.r4.model.Patient fhirPatient = new org.hl7.fhir.r4.model.Patient();
        if (id != null) {
            fhirPatient.setId("Patient/" + id);
        }

        if (patientCode != null) {
            fhirPatient.addIdentifier()
                    .setSystem("urn:sentinel:mrn")
                    .setValue(patientCode);
        }

        if (abhaId != null && !abhaId.isBlank()) {
            fhirPatient.addIdentifier()
                    .setSystem("https://healthid.ndhm.gov.in")
                    .setValue(abhaId);
        }

        if (fullName != null) {
            fhirPatient.addName().setText(fullName);
        }

        if (gender != null) {
            try {
                fhirPatient.setGender(org.hl7.fhir.r4.model.Enumerations.AdministrativeGender.fromCode(gender.toLowerCase()));
            } catch (Exception e) {
                fhirPatient.setGender(org.hl7.fhir.r4.model.Enumerations.AdministrativeGender.UNKNOWN);
            }
        }

        if (dateOfBirth != null) {
            fhirPatient.setBirthDate(java.sql.Date.valueOf(dateOfBirth));
        }

        if (phone != null && !phone.isBlank()) {
            fhirPatient.addTelecom().setSystem(org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem.PHONE).setValue(phone);
        }

        if (email != null && !email.isBlank()) {
            fhirPatient.addTelecom().setSystem(org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem.EMAIL).setValue(email);
        }

        if (address != null && !address.isBlank()) {
            org.hl7.fhir.r4.model.Address addr = fhirPatient.addAddress();
            addr.setText(address);
            if (pinCode != null) {
                addr.setPostalCode(pinCode);
            }
        }

        return fhirPatient;
    }

    public com.sentinel.organization.entity.Organization getOrganization() {
        return organization;
    }

    public void setOrganization(com.sentinel.organization.entity.Organization organization) {
        this.organization = organization;
    }
}

