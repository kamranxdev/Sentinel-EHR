package com.sentinel.service;

import com.sentinel.clinical.repository.AllergyRepository;
import com.sentinel.clinical.repository.DiagnosisRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.fhir.service.FhirService;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import com.sentinel.clinical.repository.VitalsRepository;
import org.hl7.fhir.r4.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FhirServiceTest {

    private PatientRepository patientRepository;
    private EncounterRepository encounterRepository;
    private AllergyRepository allergyRepository;
    private DiagnosisRepository diagnosisRepository;
    private PrescriptionRepository prescriptionRepository;
    private VitalsRepository vitalsRepository;

    private FhirService fhirService;

    @BeforeEach
    public void setUp() {
        patientRepository = mock(PatientRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        allergyRepository = mock(AllergyRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        prescriptionRepository = mock(PrescriptionRepository.class);
        vitalsRepository = mock(VitalsRepository.class);

        fhirService = new FhirService(patientRepository, encounterRepository, allergyRepository,
                diagnosisRepository, prescriptionRepository, vitalsRepository);
    }

    @Test
    public void testGetCapabilityStatement() {
        CapabilityStatement cs = fhirService.getCapabilityStatement();
        assertNotNull(cs);
        assertEquals(Enumerations.PublicationStatus.ACTIVE, cs.getStatus());
        assertEquals(Enumerations.FHIRVersion._4_0_1, cs.getFhirVersion());
    }

    @Test
    public void testCreatePatientFromFhir() {
        org.hl7.fhir.r4.model.Patient fhirPatient = new org.hl7.fhir.r4.model.Patient();
        fhirPatient.addName().addGiven("Jane");
        
        UUID newId = UUID.randomUUID();
        when(patientRepository.save(any())).thenAnswer(inv -> {
            Patient p = inv.getArgument(0);
            p.setId(newId);
            return p;
        });

        Patient created = fhirService.createPatientFromFhir(fhirPatient);
        assertNotNull(created);
        assertEquals(newId, created.getId());
    }
}
