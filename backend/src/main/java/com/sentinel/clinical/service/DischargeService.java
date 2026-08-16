package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.DischargePatientRequest;
import com.sentinel.clinical.dto.DischargeResponseDTO;
import com.sentinel.clinical.entity.Discharge;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.DischargeRepository;
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
public class DischargeService {

    private final DischargeRepository dischargeRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final BedRepository bedRepository;
    private final AuditService auditService;

    public DischargeService(DischargeRepository dischargeRepository,
                            EncounterRepository encounterRepository,
                            EncounterLocationRepository encounterLocationRepository,
                            BedRepository bedRepository,
                            AuditService auditService) {
        this.dischargeRepository = dischargeRepository;
        this.encounterRepository = encounterRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.bedRepository = bedRepository;
        this.auditService = auditService;
    }

    public DischargeResponseDTO dischargePatient(UUID encounterId, DischargePatientRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        encounter.setStatus("DISCHARGED");
        encounter.setEndedAt(OffsetDateTime.now());
        encounter.setDisposition(request.getDischargeDisposition());
        encounter.setUpdatedAt(OffsetDateTime.now());
        encounterRepository.save(encounter);

        encounterLocationRepository.findActiveByEncounterId(encounterId).ifPresent(loc -> {
            loc.setStatus("COMPLETED");
            loc.setEndTime(OffsetDateTime.now());
            encounterLocationRepository.save(loc);

            if (loc.getBed() != null) {
                Bed bed = loc.getBed();
                bed.setStatus("AVAILABLE");
                bedRepository.save(bed);
            }
        });

        Discharge discharge = new Discharge();
        discharge.setEncounter(encounter);
        discharge.setPatient(encounter.getPatient());
        discharge.setDischargeDisposition(request.getDischargeDisposition());
        discharge.setDischargeSummary(request.getDischargeSummary());
        discharge.setDischargedAt(OffsetDateTime.now());
        Discharge saved = dischargeRepository.save(discharge);

        if (auditService != null) {
            auditService.logEvent(encounter.getId(), "PATIENT_DISCHARGED", "Patient discharged on encounter " + encounter.getEncounterNumber());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public DischargeResponseDTO getDischarge(UUID encounterId) {
        Discharge discharge = dischargeRepository.findByEncounterId(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Discharge record not found for encounter: " + encounterId));
        return mapToDTO(discharge);
    }

    public DischargeResponseDTO mapToDTO(Discharge d) {
        DischargeResponseDTO dto = new DischargeResponseDTO();
        dto.setId(d.getId());
        if (d.getEncounter() != null) dto.setEncounterId(d.getEncounter().getId());
        if (d.getPatient() != null) dto.setPatientId(d.getPatient().getId());
        dto.setDischargeDisposition(d.getDischargeDisposition());
        dto.setDischargeSummary(d.getDischargeSummary());
        dto.setDischargedAt(d.getDischargedAt());
        return dto;
    }
}
