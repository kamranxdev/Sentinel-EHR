package com.sentinel.fhir.service;

import com.sentinel.clinical.entity.Allergy;
import com.sentinel.clinical.repository.AllergyRepository;
import com.sentinel.clinical.entity.Diagnosis;
import com.sentinel.clinical.repository.DiagnosisRepository;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import com.sentinel.clinical.entity.Vitals;
import com.sentinel.clinical.repository.VitalsRepository;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FhirService {

    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;

    public FhirService(PatientRepository patientRepository,
                       EncounterRepository encounterRepository,
                       AllergyRepository allergyRepository,
                       DiagnosisRepository diagnosisRepository,
                       PrescriptionRepository prescriptionRepository,
                       VitalsRepository vitalsRepository) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
    }

    public CapabilityStatement getCapabilityStatement() {
        CapabilityStatement statement = new CapabilityStatement();
        statement.setId("sentinel-fhir-r4-capability");
        statement.setStatus(Enumerations.PublicationStatus.ACTIVE);
        statement.setDate(new Date());
        statement.setKind(CapabilityStatement.CapabilityStatementKind.INSTANCE);
        statement.setPublisher("Sentinel Health Systems Engine");
        statement.setFhirVersion(Enumerations.FHIRVersion._4_0_1);
        return statement;
    }

    public Optional<Patient> getPatientEntityById(UUID id) {
        return patientRepository.findById(id);
    }

    public boolean patientExists(UUID id) {
        return patientRepository.existsById(id);
    }

    public void deletePatientById(UUID id) {
        patientRepository.deleteById(id);
    }

    public Patient createPatientFromFhir(org.hl7.fhir.r4.model.Patient fhirPatient) {
        Person person = new Person();
        if (fhirPatient.hasName()) {
            person.setFirstName(fhirPatient.getNameFirstRep().getNameAsSingleString());
        } else {
            person.setFirstName("Unknown Patient");
        }

        Patient entity = new Patient(person);
        entity.setPatientCode("MRN-" + System.currentTimeMillis());
        return patientRepository.save(entity);
    }

    public Bundle getPatientEverythingBundle(UUID patientId) {
        Bundle bundle = new Bundle();
        bundle.setId("bundle-patient-" + patientId);
        bundle.setType(Bundle.BundleType.SEARCHSET);
        bundle.setTimestamp(new Date());

        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return bundle;
        }

        Patient patient = patientOpt.get();
        org.hl7.fhir.r4.model.Patient fhirPatient = new org.hl7.fhir.r4.model.Patient();
        fhirPatient.setId(patient.getId().toString());
        fhirPatient.addName().addGiven(patient.getFullName());
        bundle.addEntry().setResource(fhirPatient);

        // Encounters
        List<Encounter> encounters = searchEncounters(patientId);
        for (Encounter enc : encounters) {
            org.hl7.fhir.r4.model.Encounter fhirEnc = new org.hl7.fhir.r4.model.Encounter();
            fhirEnc.setId(enc.getId().toString());
            fhirEnc.setSubject(new Reference("Patient/" + patientId));
            if ("INPATIENT".equalsIgnoreCase(enc.getEncounterType())) {
                fhirEnc.setClass_(new Coding("http://terminology.hl7.org/CodeSystem/v3-ActCode", "IMP", "inpatient encounter"));
            } else {
                fhirEnc.setClass_(new Coding("http://terminology.hl7.org/CodeSystem/v3-ActCode", "AMB", "ambulatory"));
            }
            bundle.addEntry().setResource(fhirEnc);
        }

        // Conditions / Diagnoses
        List<Diagnosis> diagnoses = searchConditions(patientId);
        for (Diagnosis diag : diagnoses) {
            org.hl7.fhir.r4.model.Condition fhirCond = new org.hl7.fhir.r4.model.Condition();
            fhirCond.setId(diag.getId().toString());
            fhirCond.setSubject(new Reference("Patient/" + patientId));
            bundle.addEntry().setResource(fhirCond);
        }

        // Medications
        List<Prescription> prescriptions = searchMedications(patientId);
        for (Prescription rx : prescriptions) {
            org.hl7.fhir.r4.model.MedicationRequest fhirReq = new org.hl7.fhir.r4.model.MedicationRequest();
            fhirReq.setId(rx.getId().toString());
            fhirReq.setSubject(new Reference("Patient/" + patientId));
            bundle.addEntry().setResource(fhirReq);
        }

        // Observations / Vitals
        List<Vitals> vitals = searchObservations(patientId);
        for (Vitals v : vitals) {
            org.hl7.fhir.r4.model.Observation fhirObs = new org.hl7.fhir.r4.model.Observation();
            fhirObs.setId(v.getId().toString());
            fhirObs.setSubject(new Reference("Patient/" + patientId));
            fhirObs.setStatus(org.hl7.fhir.r4.model.Observation.ObservationStatus.FINAL);
            bundle.addEntry().setResource(fhirObs);
        }

        // Allergies
        List<Allergy> allergies = searchAllergies(patientId);
        for (Allergy allergy : allergies) {
            org.hl7.fhir.r4.model.AllergyIntolerance fhirAllergy = new org.hl7.fhir.r4.model.AllergyIntolerance();
            fhirAllergy.setId(allergy.getId().toString());
            fhirAllergy.setPatient(new Reference("Patient/" + patientId));
            bundle.addEntry().setResource(fhirAllergy);
        }

        bundle.setTotal(bundle.getEntry().size());
        return bundle;
    }

    public List<Encounter> searchEncounters(UUID patientId) {
        return patientId != null ? encounterRepository.findByPatientIdOrderByStartedAtDesc(patientId) : encounterRepository.findAll();
    }

    public Optional<Encounter> getEncounterById(UUID id) {
        return encounterRepository.findById(id);
    }

    public List<Allergy> searchAllergies(UUID patientId) {
        return patientId != null ? allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId) : allergyRepository.findAll();
    }

    public Optional<Allergy> getAllergyEntityById(UUID id) {
        return allergyRepository.findById(id);
    }

    public List<Diagnosis> searchConditions(UUID patientId) {
        return patientId != null ? diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId) : diagnosisRepository.findAll();
    }

    public Optional<Diagnosis> getConditionById(UUID id) {
        return diagnosisRepository.findById(id);
    }

    public List<Prescription> searchMedications(UUID patientId) {
        return patientId != null ? prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId) : prescriptionRepository.findAll();
    }

    public Optional<Prescription> getMedicationById(UUID id) {
        return prescriptionRepository.findById(id);
    }

    public List<Vitals> searchObservations(UUID patientId) {
        return patientId != null ? vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId) : vitalsRepository.findAll();
    }

    public Optional<Vitals> getObservationById(UUID id) {
        return vitalsRepository.findById(id);
    }
}
