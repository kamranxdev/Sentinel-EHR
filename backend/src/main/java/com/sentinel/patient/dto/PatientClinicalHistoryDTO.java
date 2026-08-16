package com.sentinel.patient.dto;

import com.sentinel.clinical.entity.Allergy;
import com.sentinel.clinical.entity.ClinicalDocument;
import com.sentinel.clinical.entity.Diagnosis;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.patient.entity.Patient;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.clinical.entity.Vitals;

import java.util.List;

public class PatientClinicalHistoryDTO {
    private Patient patient;
    private List<Encounter> encounters;
    private List<ClinicalDocument> clinicalDocuments;
    private List<Diagnosis> diagnoses;
    private List<Allergy> allergies;
    private List<Vitals> vitals;
    private List<Prescription> prescriptions;

    public PatientClinicalHistoryDTO() {}

    public PatientClinicalHistoryDTO(Patient patient, List<Encounter> encounters,
                                     List<ClinicalDocument> clinicalDocuments,
                                     List<Diagnosis> diagnoses, List<Allergy> allergies,
                                     List<Vitals> vitals, List<Prescription> prescriptions) {
        this.patient = patient;
        this.encounters = encounters;
        this.clinicalDocuments = clinicalDocuments;
        this.diagnoses = diagnoses;
        this.allergies = allergies;
        this.vitals = vitals;
        this.prescriptions = prescriptions;
    }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public List<Encounter> getEncounters() { return encounters; }
    public void setEncounters(List<Encounter> encounters) { this.encounters = encounters; }

    public List<ClinicalDocument> getClinicalDocuments() { return clinicalDocuments; }
    public void setClinicalDocuments(List<ClinicalDocument> clinicalDocuments) { this.clinicalDocuments = clinicalDocuments; }

    public List<Diagnosis> getDiagnoses() { return diagnoses; }
    public void setDiagnoses(List<Diagnosis> diagnoses) { this.diagnoses = diagnoses; }

    public List<Allergy> getAllergies() { return allergies; }
    public void setAllergies(List<Allergy> allergies) { this.allergies = allergies; }

    public List<Vitals> getVitals() { return vitals; }
    public void setVitals(List<Vitals> vitals) { this.vitals = vitals; }

    public List<Prescription> getPrescriptions() { return prescriptions; }
    public void setPrescriptions(List<Prescription> prescriptions) { this.prescriptions = prescriptions; }
}
