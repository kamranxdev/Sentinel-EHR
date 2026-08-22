package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.AdmissionResponseDTO;
import com.sentinel.clinical.dto.AdmitPatientRequest;
import com.sentinel.clinical.entity.Admission;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.entity.EncounterLocation;
import com.sentinel.clinical.repository.AdmissionRepository;
import com.sentinel.clinical.repository.EncounterLocationRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.entity.Bed;
import com.sentinel.tenancy.repository.BedRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final EncounterRepository encounterRepository;
    private final BedRepository bedRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final AuditService auditService;

    public AdmissionService(AdmissionRepository admissionRepository,
                            EncounterRepository encounterRepository,
                            BedRepository bedRepository,
                            EncounterLocationRepository encounterLocationRepository,
                            AuditService auditService) {
        this.admissionRepository = admissionRepository;
        this.encounterRepository = encounterRepository;
        this.bedRepository = bedRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.auditService = auditService;
    }

    public AdmissionResponseDTO admitPatient(UUID sourceEncounterId, AdmitPatientRequest request) {
        Encounter sourceEncounter = encounterRepository.findById(sourceEncounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + sourceEncounterId));

        Encounter inpatientEncounter;

        // If the source encounter is already an Inpatient encounter, attach admission directly
        if ("INPATIENT".equalsIgnoreCase(sourceEncounter.getEncounterType())) {
            inpatientEncounter = sourceEncounter;
            inpatientEncounter.setStatus("IN_PROGRESS");
            inpatientEncounter.setAdmissionSource(request.getAdmissionSource());
            if (request.getAdmitReason() != null) inpatientEncounter.setReasonForVisit(request.getAdmitReason());
            inpatientEncounter.setUpdatedAt(OffsetDateTime.now());
            encounterRepository.save(inpatientEncounter);
        } else {
            // Under clean Sentinel architecture: Create new Inpatient Encounter E_inpatient linked to E_source
            inpatientEncounter = new Encounter();
            inpatientEncounter.setOrganization(sourceEncounter.getOrganization());
            inpatientEncounter.setPatient(sourceEncounter.getPatient());
            inpatientEncounter.setDepartment(sourceEncounter.getDepartment());
            inpatientEncounter.setCareEpisode(sourceEncounter.getCareEpisode());
            inpatientEncounter.setSourceEncounter(sourceEncounter);
            inpatientEncounter.setRelationshipType("ADMISSION_FROM");
            inpatientEncounter.setEncounterNumber("ENC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            inpatientEncounter.setEncounterType("INPATIENT");
            inpatientEncounter.setStatus("IN_PROGRESS");
            inpatientEncounter.setChiefComplaint(sourceEncounter.getChiefComplaint());
            inpatientEncounter.setReasonForVisit(request.getAdmitReason() != null ? request.getAdmitReason() : sourceEncounter.getReasonForVisit());
            inpatientEncounter.setAdmissionSource(request.getAdmissionSource() != null ? request.getAdmissionSource() : sourceEncounter.getEncounterType());
            inpatientEncounter.setAttendingPractitioner(sourceEncounter.getAttendingPractitioner());
            inpatientEncounter.setStartedAt(OffsetDateTime.now());
            inpatientEncounter.setCreatedAt(OffsetDateTime.now());
            inpatientEncounter.setUpdatedAt(OffsetDateTime.now());
            inpatientEncounter = encounterRepository.save(inpatientEncounter);

            // Complete source emergency/outpatient encounter with disposition = ADMIT
            sourceEncounter.setDisposition("ADMIT");
            sourceEncounter.setStatus("COMPLETED");
            sourceEncounter.setEndedAt(OffsetDateTime.now());
            sourceEncounter.setUpdatedAt(OffsetDateTime.now());
            encounterRepository.save(sourceEncounter);
        }

        Admission admission = new Admission();
        admission.setEncounter(inpatientEncounter);
        admission.setSourceEncounter(sourceEncounter);
        admission.setPatient(inpatientEncounter.getPatient());
        admission.setAdmissionType("EMERGENCY".equalsIgnoreCase(sourceEncounter.getEncounterType()) ? "EMERGENCY" : "ELECTIVE");
        admission.setAdmissionSource(request.getAdmissionSource() != null ? request.getAdmissionSource() : sourceEncounter.getEncounterType());
        admission.setAdmitReason(request.getAdmitReason() != null ? request.getAdmitReason() : inpatientEncounter.getReasonForVisit());
        admission.setStatus("ADMITTED");
        admission.setAdmittedAt(OffsetDateTime.now());
        Admission savedAdmission = admissionRepository.save(admission);

        final Encounter targetEncounter = inpatientEncounter;
        if (request.getBedId() != null) {
            bedRepository.findById(request.getBedId()).ifPresent(bed -> {
                bed.setStatus("OCCUPIED");
                bedRepository.save(bed);

                EncounterLocation location = new EncounterLocation();
                location.setEncounter(targetEncounter);
                location.setBed(bed);
                location.setStartTime(OffsetDateTime.now());
                location.setStatus("ACTIVE");
                encounterLocationRepository.save(location);
            });
        }

        if (auditService != null) {
            auditService.logEvent(targetEncounter.getId(), "PATIENT_ADMITTED",
                    "Patient admitted on inpatient encounter " + targetEncounter.getEncounterNumber() + " (Source: " + sourceEncounter.getEncounterNumber() + ")");
        }

        return mapToDTO(savedAdmission);
    }

    @Transactional(readOnly = true)
    public AdmissionResponseDTO getAdmission(UUID encounterId) {
        Admission admission = admissionRepository.findByEncounterId(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Admission record not found for encounter: " + encounterId));
        return mapToDTO(admission);
    }

    public void cancelAdmission(UUID admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + admissionId));

        Encounter encounter = admission.getEncounter();
        if (encounter != null) {
            encounterLocationRepository.findActiveByEncounterId(encounter.getId()).ifPresent(loc -> {
                loc.setStatus("CANCELLED");
                loc.setEndTime(OffsetDateTime.now());
                encounterLocationRepository.save(loc);

                if (loc.getBed() != null) {
                    Bed bed = loc.getBed();
                    bed.setStatus("AVAILABLE");
                    bedRepository.save(bed);
                }
            });
            encounter.setStatus("CANCELLED");
            encounter.setEndedAt(OffsetDateTime.now());
            encounterRepository.save(encounter);
        }

        admission.setStatus("CANCELLED");
        admissionRepository.save(admission);
    }

    public AdmissionResponseDTO mapToDTO(Admission a) {
        AdmissionResponseDTO dto = new AdmissionResponseDTO();
        dto.setId(a.getId());
        if (a.getEncounter() != null) dto.setEncounterId(a.getEncounter().getId());
        if (a.getPatient() != null) dto.setPatientId(a.getPatient().getId());
        dto.setAdmissionSource(a.getAdmissionSource());
        dto.setAdmitReason(a.getAdmitReason());
        dto.setAdmittedAt(a.getAdmittedAt());
        dto.setDischargedAt(a.getDischargedAt());
        dto.setDischargeDisposition(a.getDischargeDisposition());
        dto.setLengthOfStayDays(a.getLengthOfStayDays());

        if (a.getEncounter() != null) {
            encounterLocationRepository.findActiveByEncounterId(a.getEncounter().getId()).ifPresent(loc -> {
                if (loc.getBed() != null) {
                    dto.setBedId(loc.getBed().getId());
                    dto.setBedNumber(loc.getBed().getBedNumber());
                }
            });
        }

        return dto;
    }
}
