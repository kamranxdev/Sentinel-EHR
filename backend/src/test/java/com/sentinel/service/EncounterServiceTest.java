package com.sentinel.service;

import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.AdmissionRepository;
import com.sentinel.clinical.repository.CareEpisodeRepository;
import com.sentinel.clinical.repository.EncounterLocationRepository;
import com.sentinel.clinical.repository.EncounterParticipantRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.service.CareEpisodeService;
import com.sentinel.clinical.service.EncounterService;
import com.sentinel.clinical.service.AdmissionService;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import com.sentinel.audit.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class EncounterServiceTest {

    private EncounterRepository encounterRepository;
    private EncounterLocationRepository encounterLocationRepository;
    private EncounterParticipantRepository encounterParticipantRepository;
    private CareEpisodeRepository careEpisodeRepository;
    private CareEpisodeService careEpisodeService;
    private AdmissionRepository admissionRepository;
    private AdmissionService admissionService;
    private PatientRepository patientRepository;
    private PatientOrganizationRepository patientOrganizationRepository;
    private OrganizationRepository organizationRepository;
    private DepartmentRepository departmentRepository;
    private UserRepository userRepository;
    private AuditService auditService;

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
        encounterLocationRepository = mock(EncounterLocationRepository.class);
        encounterParticipantRepository = mock(EncounterParticipantRepository.class);
        careEpisodeRepository = mock(CareEpisodeRepository.class);
        careEpisodeService = mock(CareEpisodeService.class);
        admissionRepository = mock(AdmissionRepository.class);
        admissionService = mock(AdmissionService.class);
        patientRepository = mock(PatientRepository.class);
        patientOrganizationRepository = mock(PatientOrganizationRepository.class);
        organizationRepository = mock(OrganizationRepository.class);
        departmentRepository = mock(DepartmentRepository.class);
        userRepository = mock(UserRepository.class);
        auditService = mock(AuditService.class);

        encounterService = new EncounterService(
                encounterRepository,
                encounterLocationRepository,
                encounterParticipantRepository,
                careEpisodeRepository,
                careEpisodeService,
                admissionRepository,
                admissionService,
                patientRepository,
                patientOrganizationRepository,
                organizationRepository,
                departmentRepository,
                userRepository,
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
        testEncounter.setEncounterType("OUTPATIENT");
        testEncounter.setStatus("COMPLETED");
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
