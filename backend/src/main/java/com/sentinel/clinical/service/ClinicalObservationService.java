package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.ClinicalObservationResponseDTO;
import com.sentinel.clinical.dto.RecordObservationRequest;
import com.sentinel.clinical.entity.ClinicalObservation;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.ClinicalObservationRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClinicalObservationService {

    private final ClinicalObservationRepository observationRepository;
    private final EncounterRepository encounterRepository;

    public ClinicalObservationService(ClinicalObservationRepository observationRepository,
                                      EncounterRepository encounterRepository) {
        this.observationRepository = observationRepository;
        this.encounterRepository = encounterRepository;
    }

    public ClinicalObservationResponseDTO recordObservation(UUID encounterId, RecordObservationRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        ClinicalObservation obs = new ClinicalObservation();
        obs.setPatient(encounter.getPatient());
        obs.setEncounter(encounter);
        obs.setObservationCode(request.getObservationCode());
        obs.setObservationName(request.getObservationName());
        obs.setValueString(request.getValueString());
        obs.setValueUnit(request.getValueUnit());
        obs.setStatus("FINAL");
        obs.setObservedAt(OffsetDateTime.now());

        ClinicalObservation saved = observationRepository.save(obs);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ClinicalObservationResponseDTO> getEncounterObservations(UUID encounterId) {
        return observationRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClinicalObservationResponseDTO> getPatientObservations(UUID patientId) {
        return observationRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ClinicalObservationResponseDTO mapToDTO(ClinicalObservation o) {
        ClinicalObservationResponseDTO dto = new ClinicalObservationResponseDTO();
        dto.setId(o.getId());
        if (o.getPatient() != null) dto.setPatientId(o.getPatient().getId());
        if (o.getEncounter() != null) dto.setEncounterId(o.getEncounter().getId());
        dto.setObservationCode(o.getObservationCode());
        dto.setObservationName(o.getObservationName());
        dto.setValueString(o.getValueString());
        dto.setValueUnit(o.getValueUnit());
        dto.setStatus(o.getStatus());
        if (o.getRecordedBy() != null) dto.setRecordedByUsername(o.getRecordedBy().getUsername());
        dto.setObservedAt(o.getObservedAt());
        return dto;
    }
}
