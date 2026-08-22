package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.*;
import com.sentinel.clinical.entity.*;
import com.sentinel.clinical.repository.AdmissionRepository;
import com.sentinel.clinical.repository.CareEpisodeRepository;
import com.sentinel.clinical.repository.EncounterLocationRepository;
import com.sentinel.clinical.repository.EncounterParticipantRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EncounterService {

    private final EncounterRepository encounterRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final EncounterParticipantRepository encounterParticipantRepository;
    private final CareEpisodeRepository careEpisodeRepository;
    private final CareEpisodeService careEpisodeService;
    private final AdmissionRepository admissionRepository;
    private final AdmissionService admissionService;
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @org.springframework.beans.factory.annotation.Autowired
    public EncounterService(EncounterRepository encounterRepository,
                            EncounterLocationRepository encounterLocationRepository,
                            EncounterParticipantRepository encounterParticipantRepository,
                            CareEpisodeRepository careEpisodeRepository,
                            @Lazy CareEpisodeService careEpisodeService,
                            AdmissionRepository admissionRepository,
                            @Lazy AdmissionService admissionService,
                            PatientRepository patientRepository,
                            PatientOrganizationRepository patientOrganizationRepository,
                            OrganizationRepository organizationRepository,
                            DepartmentRepository departmentRepository,
                            UserRepository userRepository,
                            AuditService auditService) {
        this.encounterRepository = encounterRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.encounterParticipantRepository = encounterParticipantRepository;
        this.careEpisodeRepository = careEpisodeRepository;
        this.careEpisodeService = careEpisodeService;
        this.admissionRepository = admissionRepository;
        this.admissionService = admissionService;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public EncounterResponseDTO createEncounter(CreateEncounterRequest request) {
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

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        CareEpisode careEpisode = null;
        if (request.getCareEpisodeId() != null) {
            careEpisode = careEpisodeRepository.findById(request.getCareEpisodeId()).orElse(null);
        }
        if (careEpisode == null && org != null && careEpisodeService != null) {
            String defaultType = "EMERGENCY".equalsIgnoreCase(request.getEncounterType()) ? "EMERGENCY_EPISODE" : "OUTPATIENT_CARE";
            String title = request.getChiefComplaint() != null ? request.getChiefComplaint() : ("Care Episode for " + (request.getEncounterType() != null ? request.getEncounterType() : "OUTPATIENT"));
            careEpisode = careEpisodeService.getOrCreateActiveEpisode(patient, org, defaultType, title);
        }

        Encounter sourceEncounter = null;
        if (request.getSourceEncounterId() != null) {
            sourceEncounter = encounterRepository.findById(request.getSourceEncounterId()).orElse(null);
        }

        User attendingPractitioner = null;
        if (request.getAttendingPractitionerId() != null) {
            attendingPractitioner = userRepository.findById(request.getAttendingPractitionerId()).orElse(null);
        }

        Encounter encounter = new Encounter();
        encounter.setOrganization(org);
        encounter.setPatient(patient);
        encounter.setDepartment(department);
        encounter.setCareEpisode(careEpisode);
        encounter.setSourceEncounter(sourceEncounter);
        encounter.setRelationshipType(request.getRelationshipType());
        encounter.setEncounterNumber("ENC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        encounter.setEncounterType(request.getEncounterType() != null ? request.getEncounterType() : "OUTPATIENT");
        encounter.setStatus("IN_PROGRESS");
        encounter.setChiefComplaint(request.getChiefComplaint());
        encounter.setReasonForVisit(request.getReasonForVisit());
        encounter.setAdmissionSource(request.getAdmissionSource());
        encounter.setAdmissionType(request.getAdmissionType());
        encounter.setAcuity(request.getAcuity());
        encounter.setDisposition(request.getDisposition());
        encounter.setAppointmentId(request.getAppointmentId());
        encounter.setAttendingPractitioner(attendingPractitioner);
        encounter.setStartedAt(OffsetDateTime.now());
        encounter.setCreatedAt(OffsetDateTime.now());
        encounter.setUpdatedAt(OffsetDateTime.now());

        Encounter saved = encounterRepository.save(encounter);

        if (attendingPractitioner != null && org != null) {
            EncounterParticipant participant = new EncounterParticipant(org, saved, attendingPractitioner, "PRIMARY");
            encounterParticipantRepository.save(participant);
        }

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ENCOUNTER_STARTED", "Encounter " + saved.getEncounterNumber() + " (" + saved.getEncounterType() + ") started");
        }

        return mapToDTO(saved);
    }

    /**
     * Auto-creates an outpatient encounter when a patient checks in for an appointment.
     * Places encounter in an active Care Episode.
     */
    public EncounterResponseDTO openEncounterFromAppointment(Appointment appointment) {
        CareEpisode careEpisode = null;
        if (appointment.getOrganization() != null && careEpisodeService != null) {
            careEpisode = careEpisodeService.getOrCreateActiveEpisode(
                    appointment.getPatient(),
                    appointment.getOrganization(),
                    "OUTPATIENT_CARE",
                    appointment.getReason() != null ? appointment.getReason() : "Outpatient Clinic Visit"
            );
        }

        Encounter encounter = new Encounter();
        encounter.setOrganization(appointment.getOrganization());
        encounter.setPatient(appointment.getPatient());
        encounter.setDepartment(appointment.getDepartment());
        encounter.setCareEpisode(careEpisode);
        encounter.setEncounterNumber("ENC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        String type = appointment.getEncounterType() != null ? appointment.getEncounterType() : "OUTPATIENT";
        encounter.setEncounterType(type);
        encounter.setStatus("IN_PROGRESS");
        encounter.setReasonForVisit(appointment.getReason());
        encounter.setChiefComplaint(appointment.getReason());
        encounter.setAppointmentId(appointment.getId());

        if (appointment.getPractitioner() != null) {
            encounter.setAttendingPractitioner(appointment.getPractitioner());
            encounter.setCreatedBy(appointment.getPractitioner());
        } else if (appointment.getCreatedBy() != null) {
            encounter.setCreatedBy(appointment.getCreatedBy());
        }

        encounter.setStartedAt(OffsetDateTime.now());
        encounter.setCreatedAt(OffsetDateTime.now());
        encounter.setUpdatedAt(OffsetDateTime.now());

        Encounter saved = encounterRepository.save(encounter);

        if (appointment.getPractitioner() != null && appointment.getOrganization() != null) {
            EncounterParticipant participant = new EncounterParticipant(
                    appointment.getOrganization(),
                    saved,
                    appointment.getPractitioner(),
                    "PRIMARY"
            );
            encounterParticipantRepository.save(participant);
        }

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ENCOUNTER_OPENED_FROM_APPOINTMENT",
                    "Encounter " + saved.getEncounterNumber() + " auto-created from appointment " + appointment.getId());
        }

        return mapToDTO(saved);
    }

    /**
     * Proper Emergency to Inpatient Admission Transition:
     * Creates a new Inpatient Encounter E201 linked to E200 via ADMISSION_FROM under the same Care Episode,
     * creates the Admission entity linking both, and completes the Emergency Encounter with disposition = ADMIT.
     */
    @Transactional
    public EncounterResponseDTO promoteToAdmission(UUID encounterId, AdmissionRequest request) {
        Encounter sourceEncounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Source encounter not found: " + encounterId));

        AdmitPatientRequest admitRequest = new AdmitPatientRequest();
        admitRequest.setAdmissionSource(request.getAdmissionSource() != null ? request.getAdmissionSource() : (sourceEncounter.getEncounterType() != null ? sourceEncounter.getEncounterType() : "EMERGENCY"));
        admitRequest.setAdmitReason(request.getAdmitReason() != null ? request.getAdmitReason() : sourceEncounter.getReasonForVisit());
        admitRequest.setBedId(request.getBedId());

        AdmissionResponseDTO admissionDTO = admissionService.admitPatient(encounterId, admitRequest);

        // Return the newly created/linked inpatient encounter
        if (admissionDTO.getEncounterId() != null) {
            return getEncounter(admissionDTO.getEncounterId());
        }

        return mapToDTO(sourceEncounter);
    }

    /**
     * Emergency disposition decision handler: DISCHARGE, OBSERVE, ADMIT
     */
    public EncounterResponseDTO recordDisposition(UUID encounterId, EmergencyDispositionRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        String disp = request.getDisposition() != null ? request.getDisposition().toUpperCase() : "DISCHARGE";
        encounter.setDisposition(disp);

        if ("DISCHARGE".equals(disp)) {
            encounter.setStatus("COMPLETED");
            encounter.setEndedAt(OffsetDateTime.now());
        } else if ("OBSERVE".equals(disp)) {
            encounter.setStatus("IN_PROGRESS");
            encounter.setEncounterType("OBSERVATION");
        } else if ("ADMIT".equals(disp)) {
            encounter.setStatus("COMPLETED");
            encounter.setEndedAt(OffsetDateTime.now());

            AdmissionRequest admReq = new AdmissionRequest();
            admReq.setAdmissionSource(encounter.getEncounterType());
            admReq.setAdmitReason(request.getAdmissionReason() != null ? request.getAdmissionReason() : encounter.getChiefComplaint());
            admReq.setBedId(request.getBedId());
            admReq.setNotes(request.getNotes());

            promoteToAdmission(encounter.getId(), admReq);
        }

        encounter.setUpdatedAt(OffsetDateTime.now());
        Encounter saved = encounterRepository.save(encounter);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "EMERGENCY_DISPOSITION_RECORDED", "Disposition " + disp + " recorded for encounter " + saved.getEncounterNumber());
        }

        return mapToDTO(saved);
    }

    public EncounterParticipantResponseDTO addParticipant(UUID encounterId, AddEncounterParticipantRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        User practitioner = userRepository.findById(request.getPractitionerId())
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + request.getPractitionerId()));

        EncounterParticipant participant = new EncounterParticipant(
                encounter.getOrganization(),
                encounter,
                practitioner,
                request.getParticipantRole() != null ? request.getParticipantRole() : "PRIMARY"
        );
        EncounterParticipant saved = encounterParticipantRepository.save(participant);

        EncounterParticipantResponseDTO dto = new EncounterParticipantResponseDTO();
        dto.setId(saved.getId());
        dto.setEncounterId(encounter.getId());
        dto.setPractitionerId(practitioner.getId());
        dto.setPractitionerName(practitioner.getFullName());
        dto.setPractitionerEmail(practitioner.getEmail());
        dto.setParticipantRole(saved.getParticipantRole());
        dto.setPeriodStart(saved.getPeriodStart());
        dto.setPeriodEnd(saved.getPeriodEnd());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<EncounterParticipantResponseDTO> getParticipants(UUID encounterId) {
        return encounterParticipantRepository.findByEncounterId(encounterId).stream().map(p -> {
            EncounterParticipantResponseDTO dto = new EncounterParticipantResponseDTO();
            dto.setId(p.getId());
            dto.setEncounterId(p.getEncounter().getId());
            dto.setPractitionerId(p.getPractitioner().getId());
            dto.setPractitionerName(p.getPractitioner().getFullName());
            dto.setPractitionerEmail(p.getPractitioner().getEmail());
            dto.setParticipantRole(p.getParticipantRole());
            dto.setPeriodStart(p.getPeriodStart());
            dto.setPeriodEnd(p.getPeriodEnd());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EncounterResponseDTO getEncounterByAppointmentId(UUID appointmentId) {
        return encounterRepository.findByAppointmentId(appointmentId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("No encounter found for appointment: " + appointmentId));
    }

    @Transactional(readOnly = true)
    public EncounterResponseDTO getEncounter(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        return mapToDTO(encounter);
    }

    @Transactional(readOnly = true)
    public List<EncounterResponseDTO> getPatientEncounters(UUID patientId) {
        return encounterRepository.findByPatientIdOrderByStartedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EncounterResponseDTO> searchEncounters(EncounterSearchCriteria criteria) {
        List<Encounter> list;
        if (criteria != null && (criteria.getPatientId() != null || criteria.getOrganizationId() != null || criteria.getStatus() != null || criteria.getEncounterType() != null)) {
            list = encounterRepository.searchEncounters(criteria.getPatientId(), criteria.getOrganizationId(), criteria.getStatus(), criteria.getEncounterType());
        } else {
            list = encounterRepository.findAll();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public EncounterResponseDTO updateEncounter(UUID encounterId, UpdateEncounterRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        if (request.getEncounterType() != null) encounter.setEncounterType(request.getEncounterType());
        if (request.getStatus() != null) encounter.setStatus(request.getStatus());
        if (request.getChiefComplaint() != null) encounter.setChiefComplaint(request.getChiefComplaint());
        if (request.getReasonForVisit() != null) encounter.setReasonForVisit(request.getReasonForVisit());
        if (request.getAcuity() != null) encounter.setAcuity(request.getAcuity());
        if (request.getDisposition() != null) encounter.setDisposition(request.getDisposition());

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(encounter::setDepartment);
        }

        encounter.setUpdatedAt(OffsetDateTime.now());
        Encounter saved = encounterRepository.save(encounter);
        return mapToDTO(saved);
    }

    public EncounterResponseDTO completeEncounter(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        encounter.setStatus("COMPLETED");
        encounter.setEndedAt(OffsetDateTime.now());
        encounter.setUpdatedAt(OffsetDateTime.now());
        Encounter saved = encounterRepository.save(encounter);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ENCOUNTER_COMPLETED", "Encounter " + saved.getEncounterNumber() + " completed");
        }

        return mapToDTO(saved);
    }

    public EncounterResponseDTO mapToDTO(Encounter e) {
        EncounterResponseDTO dto = new EncounterResponseDTO();
        dto.setId(e.getId());
        if (e.getOrganization() != null) dto.setOrganizationId(e.getOrganization().getId());
        if (e.getPatient() != null) {
            dto.setPatientId(e.getPatient().getId());
            dto.setPatientName(e.getPatient().getFullName());
        }
        if (e.getCareEpisode() != null) {
            dto.setCareEpisodeId(e.getCareEpisode().getId());
            dto.setCareEpisodeCode(e.getCareEpisode().getEpisodeCode());
        }
        if (e.getSourceEncounter() != null) {
            dto.setSourceEncounterId(e.getSourceEncounter().getId());
        }
        dto.setRelationshipType(e.getRelationshipType());
        dto.setEncounterNumber(e.getEncounterNumber());
        dto.setEncounterType(e.getEncounterType());
        dto.setStatus(e.getStatus());
        if (e.getDepartment() != null) {
            dto.setDepartmentId(e.getDepartment().getId());
            dto.setDepartmentName(e.getDepartment().getName());
        }
        dto.setChiefComplaint(e.getChiefComplaint());
        dto.setReasonForVisit(e.getReasonForVisit());
        dto.setAdmissionSource(e.getAdmissionSource());
        dto.setAdmissionType(e.getAdmissionType());
        dto.setAcuity(e.getAcuity());
        dto.setAppointmentId(e.getAppointmentId());
        dto.setStartedAt(e.getStartedAt());
        dto.setEndedAt(e.getEndedAt());
        dto.setDisposition(e.getDisposition());

        if (e.getAttendingPractitioner() != null) {
            dto.setAttendingPractitionerId(e.getAttendingPractitioner().getId());
            dto.setAttendingPractitionerName(e.getAttendingPractitioner().getFullName());
        } else if (e.getCreatedBy() != null) {
            dto.setAttendingPractitionerId(e.getCreatedBy().getId());
            dto.setAttendingPractitionerName(e.getCreatedBy().getFullName());
        }

        if (e.getCreatedBy() != null) dto.setCreatedByEmail(e.getCreatedBy().getEmail());

        if (admissionRepository != null) {
            admissionRepository.findByEncounterId(e.getId()).ifPresent(a -> dto.setAdmissionId(a.getId()));
        }

        if (encounterParticipantRepository != null) {
            List<EncounterParticipantResponseDTO> parts = encounterParticipantRepository.findByEncounterId(e.getId()).stream().map(p -> {
                EncounterParticipantResponseDTO pdto = new EncounterParticipantResponseDTO();
                pdto.setId(p.getId());
                pdto.setEncounterId(e.getId());
                pdto.setPractitionerId(p.getPractitioner().getId());
                pdto.setPractitionerName(p.getPractitioner().getFullName());
                pdto.setPractitionerEmail(p.getPractitioner().getEmail());
                pdto.setParticipantRole(p.getParticipantRole());
                pdto.setPeriodStart(p.getPeriodStart());
                pdto.setPeriodEnd(p.getPeriodEnd());
                return pdto;
            }).collect(Collectors.toList());
            dto.setParticipants(parts);
        }

        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }
}
