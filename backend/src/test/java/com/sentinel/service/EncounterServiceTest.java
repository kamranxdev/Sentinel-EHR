package com.sentinel.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.service.EncounterService;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class EncounterServiceTest {

    private EncounterRepository encounterRepository;
    private PatientRepository patientRepository;
    private UserRepository userRepository;
    private AuditTrailService auditTrailService;

    private EncounterService encounterService;

    private Patient testPatient;
    private User testProvider;
    private Encounter testEncounter;

    private UUID patientId = UUID.randomUUID();
    private UUID providerId = UUID.randomUUID();
    private UUID encounterId = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        encounterRepository = mock(EncounterRepository.class);
        com.sentinel.clinical.repository.EncounterLocationRepository encounterLocationRepository = mock(com.sentinel.clinical.repository.EncounterLocationRepository.class);
        patientRepository = mock(PatientRepository.class);
        com.sentinel.patient.repository.PatientOrganizationRepository patientOrganizationRepository = mock(com.sentinel.patient.repository.PatientOrganizationRepository.class);
        com.sentinel.tenancy.repository.OrganizationRepository organizationRepository = mock(com.sentinel.tenancy.repository.OrganizationRepository.class);
        com.sentinel.tenancy.repository.FacilityRepository facilityRepository = mock(com.sentinel.tenancy.repository.FacilityRepository.class);
        com.sentinel.tenancy.repository.DepartmentRepository departmentRepository = mock(com.sentinel.tenancy.repository.DepartmentRepository.class);
        com.sentinel.audit.service.AuditService auditService = mock(com.sentinel.audit.service.AuditService.class);

        encounterService = new EncounterService(
            encounterRepository, 
            encounterLocationRepository, 
            patientRepository, 
            patientOrganizationRepository, 
            organizationRepository, 
            facilityRepository, 
            departmentRepository, 
            auditService
        );

        Person p = new Person();
        p.setFirstName("Kamran");
        p.setLastName("Khan");

        testPatient = new Patient(p);
        testPatient.setId(patientId);

        testProvider = new User("doc@sentinel.com", "pass", p);
        testProvider.setId(providerId);

        testEncounter = new Encounter();
        testEncounter.setId(encounterId);
        testEncounter.setPatient(testPatient);
        testEncounter.setEncounterType("AMBULATORY");
        testEncounter.setStatus("FINISHED");
    }

    @Test
    public void testGetEncountersByPatientId_ReturnsList() {
        when(encounterRepository.findByPatientIdOrderByStartedAtDesc(patientId))
                .thenReturn(List.of(testEncounter));

        List<com.sentinel.clinical.dto.EncounterResponseDTO> encounters = encounterService.getPatientEncounters(patientId);

        assertNotNull(encounters);
        assertEquals(1, encounters.size());
    }

    @Test
    public void testGetEncounterById_Found() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(testEncounter));

        com.sentinel.clinical.dto.EncounterResponseDTO result = encounterService.getEncounter(encounterId);

        assertNotNull(result);
        assertEquals(encounterId, result.getId());
    }
}
