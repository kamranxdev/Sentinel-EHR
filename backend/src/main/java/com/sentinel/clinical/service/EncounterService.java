package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.CreateEncounterRequest;
import com.sentinel.clinical.dto.EncounterResponseDTO;
import com.sentinel.clinical.dto.EncounterSearchCriteria;
import com.sentinel.clinical.dto.UpdateEncounterRequest;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterLocationRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EncounterService {

    private final EncounterRepository encounterRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;

    public EncounterService(EncounterRepository encounterRepository,
                            EncounterLocationRepository encounterLocationRepository,
                            PatientRepository patientRepository,
                            PatientOrganizationRepository patientOrganizationRepository,
                            OrganizationRepository organizationRepository,
                            DepartmentRepository departmentRepository,
                            AuditService auditService) {
        this.encounterRepository = encounterRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
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

        Encounter encounter = new Encounter();
        encounter.setOrganization(org);
        encounter.setPatient(patient);
        encounter.setDepartment(department);
        encounter.setEncounterNumber("ENC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        encounter.setEncounterType(request.getEncounterType() != null ? request.getEncounterType() : "OUTPATIENT");
        encounter.setStatus("IN_PROGRESS");
        encounter.setChiefComplaint(request.getChiefComplaint());
        encounter.setReasonForVisit(request.getReasonForVisit());
        encounter.setAdmissionSource(request.getAdmissionSource());
        encounter.setAdmissionType(request.getAdmissionType());
        encounter.setAcuity(request.getAcuity());
        encounter.setStartedAt(OffsetDateTime.now());
        encounter.setCreatedAt(OffsetDateTime.now());
        encounter.setUpdatedAt(OffsetDateTime.now());

        Encounter saved = encounterRepository.save(encounter);
        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ENCOUNTER_STARTED", "Encounter " + saved.getEncounterNumber() + " started");
        }

        return mapToDTO(saved);
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
        dto.setStartedAt(e.getStartedAt());
        dto.setEndedAt(e.getEndedAt());
        dto.setDisposition(e.getDisposition());
        if (e.getCreatedBy() != null) dto.setCreatedByUsername(e.getCreatedBy().getUsername());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }
}
