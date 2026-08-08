package com.medvault.patients.dto;

import com.medvault.allergies.entity.Allergy;
import com.medvault.clinicalrecords.entity.MedicalRecord;
import com.medvault.diagnoses.entity.Diagnosis;
import com.medvault.encounters.entity.Encounter;
import com.medvault.patients.entity.Patient;
import com.medvault.prescriptions.entity.Prescription;
import com.medvault.vitals.entity.Vitals;

import java.util.List;

public class PatientClinicalHistoryDTO {
    private Patient patient;
    private List<Encounter> encounters;
    private List<MedicalRecord> medicalRecords;
    private List<Diagnosis> diagnoses;
    private List<Allergy> allergies;
    private List<Vitals> vitals;
    private List<Prescription> prescriptions;

    public PatientClinicalHistoryDTO() {}

    public PatientClinicalHistoryDTO(Patient patient, List<Encounter> encounters, List<MedicalRecord> medicalRecords,
                                     List<Diagnosis> diagnoses, List<Allergy> allergies, List<Vitals> vitals,
                                     List<Prescription> prescriptions) {
        this.patient = patient;
        this.encounters = encounters;
        this.medicalRecords = medicalRecords;
        this.diagnoses = diagnoses;
        this.allergies = allergies;
        this.vitals = vitals;
        this.prescriptions = prescriptions;
    }

    public PatientClinicalHistoryDTO(Patient patient, List<Diagnosis> diagnoses, List<Allergy> allergies,
                                     List<Prescription> prescriptions, List<Vitals> vitals, List<MedicalRecord> medicalRecords) {
        this.patient = patient;
        this.diagnoses = diagnoses;
        this.allergies = allergies;
        this.prescriptions = prescriptions;
        this.vitals = vitals;
        this.medicalRecords = medicalRecords;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public List<Encounter> getEncounters() {
        return encounters;
    }

    public void setEncounters(List<Encounter> encounters) {
        this.encounters = encounters;
    }

    public List<MedicalRecord> getMedicalRecords() {
        return medicalRecords;
    }

    public void setMedicalRecords(List<MedicalRecord> medicalRecords) {
        this.medicalRecords = medicalRecords;
    }

    public List<Diagnosis> getDiagnoses() {
        return diagnoses;
    }

    public void setDiagnoses(List<Diagnosis> diagnoses) {
        this.diagnoses = diagnoses;
    }

    public List<Allergy> getAllergies() {
        return allergies;
    }

    public void setAllergies(List<Allergy> allergies) {
        this.allergies = allergies;
    }

    public List<Vitals> getVitals() {
        return vitals;
    }

    public void setVitals(List<Vitals> vitals) {
        this.vitals = vitals;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<Prescription> prescriptions) {
        this.prescriptions = prescriptions;
    }
}
