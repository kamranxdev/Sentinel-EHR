package com.sentinel.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.CareEpisodeResponseDTO;
import com.sentinel.clinical.dto.CreateCareEpisodeRequest;
import com.sentinel.clinical.entity.CareEpisode;
import com.sentinel.clinical.repository.CareEpisodeRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.service.CareEpisodeService;
import com.sentinel.clinical.service.EncounterService;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class CareEpisodeServiceTest {

    private CareEpisodeRepository careEpisodeRepository;
    private EncounterRepository encounterRepository;
    private PatientRepository patientRepository;
    private PatientOrganizationRepository patientOrganizationRepository;
    private OrganizationRepository organizationRepository;
    private UserRepository userRepository;
    private AuditService auditService;
    private EncounterService encounterService;

    private CareEpisodeService careEpisodeService;

    private Patient testPatient;
    private Organization testOrg;
    private CareEpisode testEpisode;

    private UUID patientId = UUID.randomUUID();
    private UUID orgId = UUID.randomUUID();
    private UUID episodeId = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        careEpisodeRepository = mock(CareEpisodeRepository.class);
        encounterRepository = mock(EncounterRepository.class);
        patientRepository = mock(PatientRepository.class);
        patientOrganizationRepository = mock(PatientOrganizationRepository.class);
        organizationRepository = mock(OrganizationRepository.class);
        userRepository = mock(UserRepository.class);
        auditService = mock(AuditService.class);
        encounterService = mock(EncounterService.class);

        careEpisodeService = new CareEpisodeService(
                careEpisodeRepository,
                encounterRepository,
                patientRepository,
                patientOrganizationRepository,
                organizationRepository,
                userRepository,
                auditService,
                encounterService
        );

        Person p = new Person();
        p.setFirstName("Amina");
        p.setLastName("Zaid");

        testPatient = new Patient(p);
        testPatient.setId(patientId);

        testOrg = new Organization();
        testOrg.setId(orgId);
        testOrg.setName("Sentinel Central Hospital");

        testEpisode = new CareEpisode();
        testEpisode.setId(episodeId);
        testEpisode.setPatient(testPatient);
        testEpisode.setOrganization(testOrg);
        testEpisode.setEpisodeCode("EP-TEST-01");
        testEpisode.setEpisodeType("OUTPATIENT_CARE");
        testEpisode.setStatus("ACTIVE");
        testEpisode.setTitle("Type 2 Diabetes Management");
    }

    @Test
    public void testCreateCareEpisode_Success() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(testOrg));
        when(careEpisodeRepository.save(any(CareEpisode.class))).thenReturn(testEpisode);

        CreateCareEpisodeRequest req = new CreateCareEpisodeRequest();
        req.setPatientId(patientId);
        req.setOrganizationId(orgId);
        req.setEpisodeType("OUTPATIENT_CARE");
        req.setTitle("Type 2 Diabetes Management");

        CareEpisodeResponseDTO res = careEpisodeService.createCareEpisode(req);

        assertNotNull(res);
        assertEquals(episodeId, res.getId());
        assertEquals("OUTPATIENT_CARE", res.getEpisodeType());
    }

    @Test
    public void testGetPatientCareEpisodes_ReturnsList() {
        when(careEpisodeRepository.findByPatientIdOrderByStartedAtDesc(patientId))
                .thenReturn(List.of(testEpisode));

        List<CareEpisodeResponseDTO> list = careEpisodeService.getPatientCareEpisodes(patientId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(episodeId, list.get(0).getId());
    }
}
