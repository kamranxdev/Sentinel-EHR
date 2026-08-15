package com.sentinel.fhir.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.repository.VitalsRepository;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FhirService {

    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final UserRepository userRepository;

    public FhirService(PatientRepository patientRepository,
                       EncounterRepository encounterRepository,
                       AllergyRepository allergyRepository,
                       DiagnosisRepository diagnosisRepository,
                       PrescriptionRepository prescriptionRepository,
                       VitalsRepository vitalsRepository,
                       UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.userRepository = userRepository;
    }

    public CapabilityStatement getCapabilityStatement() {
        CapabilityStatement statement = new CapabilityStatement();
        statement.setId("sentinel-fhir-r4-capability");
        statement.setStatus(Enumerations.PublicationStatus.ACTIVE);
        statement.setDate(new Date());
        statement.setKind(CapabilityStatement.CapabilityStatementKind.INSTANCE);
        statement.setPublisher("Sentinel Health Systems Engine");
        statement.setFhirVersion(Enumerations.FHIRVersion._4_0_1);

        CapabilityStatement.CapabilityStatementSoftwareComponent software = new CapabilityStatement.CapabilityStatementSoftwareComponent();
        software.setName("Sentinel Interoperability Core Engine (Spring Boot + Embedded HAPI FHIR)");
        software.setVersion("1.0.0-GOLD-STANDARD");
        statement.setSoftware(software);

        return statement;
    }

    public org.hl7.fhir.r4.model.Patient toPatientResource(Patient patient) {
        return patient != null ? patient.toFhirResource() : null;
    }

    public org.hl7.fhir.r4.model.Encounter toEncounterResource(Encounter encounter) {
        return encounter != null ? encounter.toFhirResource() : null;
    }

    public org.hl7.fhir.r4.model.AllergyIntolerance toAllergyResource(Allergy allergy) {
        return allergy != null ? allergy.toFhirResource() : null;
    }

    public org.hl7.fhir.r4.model.Condition toConditionResource(Diagnosis diagnosis) {
        return diagnosis != null ? diagnosis.toFhirResource() : null;
    }

    public org.hl7.fhir.r4.model.MedicationRequest toMedicationRequestResource(Prescription prescription) {
        return prescription != null ? prescription.toFhirResource() : null;
    }

    public org.hl7.fhir.r4.model.Observation toObservationResource(Vitals vitals) {
        return vitals != null ? vitals.toFhirResource() : null;
    }

    public List<Patient> searchPatients(String name, String gender, String identifier) {
        return patientRepository.findAll().stream()
                .filter(p -> name == null || (p.getFullName() != null && p.getFullName().toLowerCase().contains(name.toLowerCase())))
                .filter(p -> gender == null || (p.getGender() != null && p.getGender().equalsIgnoreCase(gender)))
                .filter(p -> identifier == null || (p.getPatientCode() != null && p.getPatientCode().equalsIgnoreCase(identifier)) || (p.getAbhaId() != null && p.getAbhaId().equalsIgnoreCase(identifier)))
                .collect(Collectors.toList());
    }

    public Optional<Patient> getPatientEntityById(Long id) {
        return patientRepository.findById(id);
    }

    public boolean patientExists(Long id) {
        return patientRepository.existsById(id);
    }

    public void deletePatientById(Long id) {
        patientRepository.deleteById(id);
    }

    public Patient createPatientFromFhir(org.hl7.fhir.r4.model.Patient fhirPatient) {
        Patient entity = new Patient();
        if (fhirPatient.hasName()) {
            entity.setFullName(fhirPatient.getNameFirstRep().getNameAsSingleString());
        } else {
            entity.setFullName("Unknown Patient");
        }

        if (fhirPatient.hasGender()) {
            entity.setGender(fhirPatient.getGender().toCode().toUpperCase());
        }

        if (fhirPatient.hasBirthDate()) {
            entity.setDateOfBirth(fhirPatient.getBirthDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate());
        }

        entity.setPatientCode("MRN-" + System.currentTimeMillis());
        return patientRepository.save(entity);
    }

    public Bundle getPatientEverythingBundle(Long patientId) {
        Bundle bundle = new Bundle();
        bundle.setId("bundle-patient-" + patientId);
        bundle.setType(Bundle.BundleType.SEARCHSET);
        bundle.setTimestamp(new Date());

        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return bundle;
        }

        Patient patient = patientOpt.get();
        bundle.addEntry().setResource(patient.toFhirResource());

        List<Encounter> encounters = encounterRepository.findByPatientId(patientId);
        for (Encounter e : encounters) {
            bundle.addEntry().setResource(e.toFhirResource());
        }

        List<Diagnosis> diagnoses = diagnosisRepository.findByPatientId(patientId);
        for (Diagnosis d : diagnoses) {
            bundle.addEntry().setResource(d.toFhirResource());
        }

        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        for (Prescription p : prescriptions) {
            bundle.addEntry().setResource(p.toFhirResource());
        }

        List<Vitals> vitals = vitalsRepository.findByPatientId(patientId);
        for (Vitals v : vitals) {
            bundle.addEntry().setResource(v.toFhirResource());
        }

        List<Allergy> allergies = allergyRepository.findByPatientId(patientId);
        for (Allergy a : allergies) {
            bundle.addEntry().setResource(a.toFhirResource());
        }

        return bundle;
    }

    public List<Encounter> searchEncounters(Long patientId) {
        return patientId != null ? encounterRepository.findByPatientId(patientId) : encounterRepository.findAll();
    }

    public Optional<Encounter> getEncounterById(Long id) {
        return encounterRepository.findById(id);
    }

    public List<Allergy> searchAllergies(Long patientId) {
        return patientId != null ? allergyRepository.findByPatientId(patientId) : allergyRepository.findAll();
    }

    public Optional<Allergy> getAllergyEntityById(Long id) {
        return allergyRepository.findById(id);
    }

    public List<Diagnosis> searchConditions(Long patientId) {
        return patientId != null ? diagnosisRepository.findByPatientId(patientId) : diagnosisRepository.findAll();
    }

    public Optional<Diagnosis> getConditionById(Long id) {
        return diagnosisRepository.findById(id);
    }

    public List<Prescription> searchMedications(Long patientId) {
        return patientId != null ? prescriptionRepository.findByPatientId(patientId) : prescriptionRepository.findAll();
    }

    public Optional<Prescription> getMedicationById(Long id) {
        return prescriptionRepository.findById(id);
    }

    public List<Vitals> searchObservations(Long patientId) {
        return patientId != null ? vitalsRepository.findByPatientId(patientId) : vitalsRepository.findAll();
    }

    public Optional<Vitals> getObservationById(Long id) {
        return vitalsRepository.findById(id);
    }

    public Bundle buildBundle(String resourceType, List<? extends Resource> resources) {
        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.SEARCHSET);
        bundle.setTotal(resources.size());
        for (Resource r : resources) {
            bundle.addEntry().setResource(r);
        }
        return bundle;
    }
}
