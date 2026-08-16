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

    public AdmissionResponseDTO admitPatient(UUID encounterId, AdmitPatientRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        encounter.setEncounterType("INPATIENT");
        encounter.setStatus("IN_PROGRESS");
        encounter.setAdmissionSource(request.getAdmissionSource());
        encounter.setReasonForVisit(request.getAdmitReason());
        encounter.setUpdatedAt(OffsetDateTime.now());
        encounterRepository.save(encounter);

        Admission admission = new Admission();
        admission.setEncounter(encounter);
        admission.setPatient(encounter.getPatient());
        admission.setAdmissionSource(request.getAdmissionSource());
        admission.setAdmitReason(request.getAdmitReason());
        admission.setAdmittedAt(OffsetDateTime.now());
        Admission savedAdmission = admissionRepository.save(admission);

        if (request.getBedId() != null) {
            Bed bed = bedRepository.findById(request.getBedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + request.getBedId()));
            bed.setStatus("OCCUPIED");
            bedRepository.save(bed);

            EncounterLocation location = new EncounterLocation();
            location.setEncounter(encounter);
            location.setBed(bed);
            location.setStartTime(OffsetDateTime.now());
            location.setStatus("ACTIVE");
            encounterLocationRepository.save(location);
        }

        if (auditService != null) {
            auditService.logEvent(encounter.getId(), "PATIENT_ADMITTED", "Patient admitted on encounter " + encounter.getEncounterNumber());
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
            encounter.setEncounterType("OUTPATIENT");
            encounterRepository.save(encounter);
        }

        admissionRepository.delete(admission);
    }

    public AdmissionResponseDTO mapToDTO(Admission a) {
        AdmissionResponseDTO dto = new AdmissionResponseDTO();
        dto.setId(a.getId());
        if (a.getEncounter() != null) dto.setEncounterId(a.getEncounter().getId());
        if (a.getPatient() != null) dto.setPatientId(a.getPatient().getId());
        dto.setAdmissionSource(a.getAdmissionSource());
        dto.setAdmitReason(a.getAdmitReason());
        dto.setAdmittedAt(a.getAdmittedAt());

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
