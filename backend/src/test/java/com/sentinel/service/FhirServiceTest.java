package com.sentinel.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.encounters.repository.LabOrderRepository;
import com.sentinel.fhir.service.FhirService;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.repository.VitalsRepository;
import org.hl7.fhir.r4.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FhirServiceTest {

    private PatientRepository patientRepository;
    private EncounterRepository encounterRepository;
    private AllergyRepository allergyRepository;
    private DiagnosisRepository diagnosisRepository;
    private PrescriptionRepository prescriptionRepository;
    private VitalsRepository vitalsRepository;
    private UserRepository userRepository;
    private LabOrderRepository labOrderRepository;

    private FhirService fhirService;

    @BeforeEach
    public void setUp() {
        patientRepository = mock(PatientRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        allergyRepository = mock(AllergyRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        vitalsRepository = mock(VitalsRepository.class);
        userRepository = mock(UserRepository.class);
        labOrderRepository = mock(LabOrderRepository.class);

        fhirService = new FhirService(patientRepository, encounterRepository, allergyRepository,
                diagnosisRepository, prescriptionRepository, vitalsRepository, userRepository, labOrderRepository);
    }

    @Test
    public void testGetCapabilityStatement() {
        CapabilityStatement cs = fhirService.getCapabilityStatement();
        assertNotNull(cs);
        assertEquals(Enumerations.PublicationStatus.ACTIVE, cs.getStatus());
        assertEquals(Enumerations.FHIRVersion._4_0_1, cs.getFhirVersion());
    }

    @Test
    public void testToPatientResource() {
        Patient p = new Patient();
        p.setId(1L);
        p.setPatientCode("PAT-1001");
        p.setFullName("Jane Doe");
        p.setGender("Female");
        p.setDateOfBirth(LocalDate.of(1990, 5, 20));

        org.hl7.fhir.r4.model.Patient resource = fhirService.toPatientResource(p);

        assertNotNull(resource);
        assertEquals("Patient/1", resource.getId());
        assertEquals(Enumerations.AdministrativeGender.FEMALE, resource.getGender());
    }

    @Test
    public void testToEncounterResource() {
        Encounter enc = new Encounter();
        enc.setId(10L);
        enc.setStatus("COMPLETED");
        enc.setEncounterType("AMBULATORY");
        enc.setEncounterDate(LocalDateTime.now());

        org.hl7.fhir.r4.model.Encounter resource = fhirService.toEncounterResource(enc);

        assertNotNull(resource);
        assertEquals("Encounter/10", resource.getId());
    }

    @Test
    public void testToAllergyResource() {
        Allergy allergy = new Allergy();
        allergy.setId(5L);
        allergy.setAllergenName("Penicillin");
        allergy.setSeverity("HIGH");

        AllergyIntolerance resource = fhirService.toAllergyResource(allergy);

        assertNotNull(resource);
        assertEquals("AllergyIntolerance/5", resource.getId());
    }

    @Test
    public void testToConditionResource() {
        Diagnosis diag = new Diagnosis();
        diag.setId(15L);
        diag.setConditionName("Type 2 Diabetes");
        diag.setIcdCode("E11.9");

        Condition resource = fhirService.toConditionResource(diag);

        assertNotNull(resource);
        assertEquals("Condition/15", resource.getId());
    }

    @Test
    public void testToMedicationRequestResource() {
        Prescription rx = new Prescription();
        rx.setId(20L);
        rx.setMedicationName("Metformin");
        rx.setDosage("500mg");
        rx.setStatus("ACTIVE");

        MedicationRequest resource = fhirService.toMedicationRequestResource(rx);

        assertNotNull(resource);
        assertEquals("MedicationRequest/20", resource.getId());
    }

    @Test
    public void testToObservationResource() {
        Vitals vitals = new Vitals();
        vitals.setId(30L);
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);
        vitals.setHeartRate(75);

        Observation resource = fhirService.toObservationResource(vitals);

        assertNotNull(resource);
        assertEquals("Observation/30", resource.getId());
    }

    @Test
    public void testBuildBundle() {
        org.hl7.fhir.r4.model.Patient p1 = new org.hl7.fhir.r4.model.Patient();
        p1.setId("Patient/1");
        Bundle bundle = fhirService.buildBundle("Patient", List.of(p1));

        assertNotNull(bundle);
        assertEquals(Bundle.BundleType.SEARCHSET, bundle.getType());
        assertEquals(1, bundle.getTotal());
    }

    @Test
    public void testGetPatientEverythingBundle_NotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        Bundle bundle = fhirService.getPatientEverythingBundle(999L);

        assertNotNull(bundle);
        assertEquals(0, bundle.getEntry().size());
    }
}
