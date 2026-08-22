package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.*;
import com.sentinel.clinical.entity.CareEpisode;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.CareEpisodeRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareEpisodeService {

    private final CareEpisodeRepository careEpisodeRepository;
    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final EncounterService encounterService;

    public CareEpisodeService(CareEpisodeRepository careEpisodeRepository,
                              EncounterRepository encounterRepository,
                              PatientRepository patientRepository,
                              PatientOrganizationRepository patientOrganizationRepository,
                              OrganizationRepository organizationRepository,
                              UserRepository userRepository,
                              AuditService auditService,
                              @org.springframework.context.annotation.Lazy EncounterService encounterService) {
        this.careEpisodeRepository = careEpisodeRepository;
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.encounterService = encounterService;
    }

    public CareEpisodeResponseDTO createCareEpisode(CreateCareEpisodeRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Organization org = null;
        if (request.getOrganizationId() != null) {
            org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + request.getOrganizationId()));
        } else {
            List<PatientOrganization> pos = patientOrganizationRepository.findByPatientId(patient.getId());
            if (!pos.isEmpty()) {
                org = pos.get(0).getOrganization();
            }
        }

        User practitioner = null;
        if (request.getPrimaryPractitionerId() != null) {
            practitioner = userRepository.findById(request.getPrimaryPractitionerId()).orElse(null);
        }

        CareEpisode episode = new CareEpisode();
        episode.setOrganization(org);
        episode.setPatient(patient);
        episode.setEpisodeCode("EP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        episode.setEpisodeType(request.getEpisodeType() != null ? request.getEpisodeType() : "OUTPATIENT_CARE");
        episode.setStatus("ACTIVE");
        episode.setTitle(request.getTitle() != null ? request.getTitle() : "Episode of Care");
        episode.setNotes(request.getNotes());
        episode.setPrimaryDiagnosisCode(request.getPrimaryDiagnosisCode());
        episode.setPrimaryDiagnosisName(request.getPrimaryDiagnosisName());
        episode.setPrimaryPractitioner(practitioner);
        episode.setStartedAt(request.getStartedAt() != null ? request.getStartedAt() : OffsetDateTime.now());
        episode.setCreatedAt(OffsetDateTime.now());
        episode.setUpdatedAt(OffsetDateTime.now());

        CareEpisode saved = careEpisodeRepository.save(episode);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "CARE_EPISODE_CREATED", "Care Episode " + saved.getEpisodeCode() + " created for patient " + patient.getId());
        }

        return mapToDTO(saved);
    }

    /**
     * Finds an open active Care Episode for a patient of the given type, or creates a new one.
     */
    public CareEpisode getOrCreateActiveEpisode(Patient patient, Organization org, String episodeType, String defaultTitle) {
        List<CareEpisode> activeList = careEpisodeRepository.findByPatientIdAndStatus(patient.getId(), "ACTIVE");
        for (CareEpisode ep : activeList) {
            if (episodeType != null && episodeType.equalsIgnoreCase(ep.getEpisodeType())) {
                return ep;
            }
        }
        if (!activeList.isEmpty()) {
            return activeList.get(0);
        }

        CareEpisode newEp = new CareEpisode();
        newEp.setOrganization(org);
        newEp.setPatient(patient);
        newEp.setEpisodeCode("EP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newEp.setEpisodeType(episodeType != null ? episodeType : "OUTPATIENT_CARE");
        newEp.setStatus("ACTIVE");
        newEp.setTitle(defaultTitle != null ? defaultTitle : "Episode of Care");
        newEp.setStartedAt(OffsetDateTime.now());
        newEp.setCreatedAt(OffsetDateTime.now());
        newEp.setUpdatedAt(OffsetDateTime.now());
        return careEpisodeRepository.save(newEp);
    }

    @Transactional(readOnly = true)
    public CareEpisodeResponseDTO getCareEpisode(UUID episodeId) {
        CareEpisode episode = careEpisodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Care Episode not found with id: " + episodeId));
        return mapToDTO(episode);
    }

    @Transactional(readOnly = true)
    public List<CareEpisodeResponseDTO> getPatientCareEpisodes(UUID patientId) {
        return careEpisodeRepository.findByPatientIdOrderByStartedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CareEpisodeResponseDTO> searchCareEpisodes(UUID patientId, UUID organizationId, String status, String episodeType) {
        return careEpisodeRepository.searchCareEpisodes(patientId, organizationId, status, episodeType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CareEpisodeResponseDTO updateCareEpisode(UUID episodeId, UpdateCareEpisodeRequest request) {
        CareEpisode episode = careEpisodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Care Episode not found with id: " + episodeId));

        if (request.getEpisodeType() != null) episode.setEpisodeType(request.getEpisodeType());
        if (request.getStatus() != null) episode.setStatus(request.getStatus());
        if (request.getTitle() != null) episode.setTitle(request.getTitle());
        if (request.getNotes() != null) episode.setNotes(request.getNotes());
        if (request.getPrimaryDiagnosisCode() != null) episode.setPrimaryDiagnosisCode(request.getPrimaryDiagnosisCode());
        if (request.getPrimaryDiagnosisName() != null) episode.setPrimaryDiagnosisName(request.getPrimaryDiagnosisName());
        if (request.getPrimaryPractitionerId() != null) {
            userRepository.findById(request.getPrimaryPractitionerId()).ifPresent(episode::setPrimaryPractitioner);
        }
        if (request.getEndedAt() != null) episode.setEndedAt(request.getEndedAt());

        episode.setUpdatedAt(OffsetDateTime.now());
        CareEpisode saved = careEpisodeRepository.save(episode);
        return mapToDTO(saved);
    }

    public CareEpisodeResponseDTO closeCareEpisode(UUID episodeId, CloseCareEpisodeRequest request) {
        CareEpisode episode = careEpisodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Care Episode not found with id: " + episodeId));

        episode.setStatus("COMPLETED");
        episode.setEndedAt(request != null && request.getEndedAt() != null ? request.getEndedAt() : OffsetDateTime.now());
        if (request != null && request.getClosingNotes() != null) {
            String existing = episode.getNotes() != null ? episode.getNotes() + "\n" : "";
            episode.setNotes(existing + "Close Outcome: " + (request.getOutcome() != null ? request.getOutcome() : "Resolved") + ". " + request.getClosingNotes());
        }
        episode.setUpdatedAt(OffsetDateTime.now());
        CareEpisode saved = careEpisodeRepository.save(episode);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "CARE_EPISODE_CLOSED", "Care Episode " + saved.getEpisodeCode() + " closed");
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<EncounterResponseDTO> getCareEpisodeEncounters(UUID episodeId) {
        return encounterRepository.findByCareEpisodeIdOrderByStartedAtDesc(episodeId).stream()
                .map(encounterService::mapToDTO)
                .collect(Collectors.toList());
    }

    public CareEpisodeResponseDTO mapToDTO(CareEpisode e) {
        CareEpisodeResponseDTO dto = new CareEpisodeResponseDTO();
        dto.setId(e.getId());
        if (e.getOrganization() != null) dto.setOrganizationId(e.getOrganization().getId());
        if (e.getPatient() != null) {
            dto.setPatientId(e.getPatient().getId());
            dto.setPatientName(e.getPatient().getFullName());
        }
        dto.setEpisodeCode(e.getEpisodeCode());
        dto.setEpisodeType(e.getEpisodeType());
        dto.setStatus(e.getStatus());
        dto.setTitle(e.getTitle());
        dto.setNotes(e.getNotes());
        dto.setPrimaryDiagnosisCode(e.getPrimaryDiagnosisCode());
        dto.setPrimaryDiagnosisName(e.getPrimaryDiagnosisName());

        if (e.getPrimaryPractitioner() != null) {
            dto.setPrimaryPractitionerId(e.getPrimaryPractitioner().getId());
            dto.setPrimaryPractitionerName(e.getPrimaryPractitioner().getFullName());
        }

        dto.setStartedAt(e.getStartedAt());
        dto.setEndedAt(e.getEndedAt());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());

        List<Encounter> encounters = encounterRepository.findByCareEpisodeIdOrderByStartedAtDesc(e.getId());
        if (!encounters.isEmpty() && encounterService != null) {
            dto.setEncounters(encounters.stream().map(encounterService::mapToDTO).collect(Collectors.toList()));
        }

        return dto;
    }
}
