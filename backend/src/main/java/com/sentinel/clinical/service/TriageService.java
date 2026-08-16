package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.TriageRequestDTO;
import com.sentinel.clinical.dto.TriageResponseDTO;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.entity.TriageEwsRecord;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.repository.TriageEwsRecordRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class TriageService {

    private final TriageEwsRecordRepository triageRepository;
    private final EncounterRepository encounterRepository;

    public TriageService(TriageEwsRecordRepository triageRepository, EncounterRepository encounterRepository) {
        this.triageRepository = triageRepository;
        this.encounterRepository = encounterRepository;
    }

    public TriageResponseDTO recordTriage(UUID encounterId, TriageRequestDTO request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        TriageEwsRecord record = new TriageEwsRecord();
        record.setPatient(encounter.getPatient());
        record.setRecordedBy(encounter.getCreatedBy());
        record.setChiefComplaint(request.getChiefComplaint());
        record.setTriagePriority(request.getTriagePriority() != null ? request.getTriagePriority() : "ROUTINE");
        record.setVitalsSummary(request.getVitalsSummary());
        record.setNotes(request.getNotes());
        record.setRecordedAt(OffsetDateTime.now());

        if (encounter.getChiefComplaint() == null && request.getChiefComplaint() != null) {
            encounter.setChiefComplaint(request.getChiefComplaint());
            encounter.setAcuity(request.getTriagePriority());
            encounterRepository.save(encounter);
        }

        TriageEwsRecord saved = triageRepository.save(record);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public TriageResponseDTO getTriage(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        TriageEwsRecord record = triageRepository.findTopByPatientIdOrderByRecordedAtDesc(encounter.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("No triage record found for encounter"));
        return mapToDTO(record);
    }

    public TriageResponseDTO updateTriage(UUID encounterId, TriageRequestDTO request) {
        return recordTriage(encounterId, request);
    }

    public TriageResponseDTO mapToDTO(TriageEwsRecord r) {
        TriageResponseDTO dto = new TriageResponseDTO();
        dto.setId(r.getId());
        if (r.getPatient() != null) dto.setPatientId(r.getPatient().getId());
        dto.setChiefComplaint(r.getChiefComplaint());
        dto.setTriagePriority(r.getTriagePriority());
        dto.setVitalsSummary(r.getVitalsSummary());
        dto.setNotes(r.getNotes());
        if (r.getRecordedBy() != null) dto.setRecordedByUsername(r.getRecordedBy().getUsername());
        dto.setRecordedAt(r.getRecordedAt());
        return dto;
    }
}
