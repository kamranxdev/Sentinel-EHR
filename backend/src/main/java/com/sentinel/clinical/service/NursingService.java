package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.AddFlowsheetEntryRequest;
import com.sentinel.clinical.dto.CreateFlowsheetRequest;
import com.sentinel.clinical.dto.NursingFlowsheetResponseDTO;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.entity.NursingFlowsheet;
import com.sentinel.clinical.entity.NursingFlowsheetEntry;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.repository.NursingFlowsheetEntryRepository;
import com.sentinel.clinical.repository.NursingFlowsheetRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NursingService {

    private final NursingFlowsheetRepository flowsheetRepository;
    private final NursingFlowsheetEntryRepository flowsheetEntryRepository;
    private final EncounterRepository encounterRepository;

    public NursingService(NursingFlowsheetRepository flowsheetRepository,
                          NursingFlowsheetEntryRepository flowsheetEntryRepository,
                          EncounterRepository encounterRepository) {
        this.flowsheetRepository = flowsheetRepository;
        this.flowsheetEntryRepository = flowsheetEntryRepository;
        this.encounterRepository = encounterRepository;
    }

    public NursingFlowsheetResponseDTO createFlowsheet(UUID encounterId, CreateFlowsheetRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        NursingFlowsheet flowsheet = new NursingFlowsheet();
        flowsheet.setEncounter(encounter);
        flowsheet.setPatient(encounter.getPatient());
        flowsheet.setFlowsheetType(request.getFlowsheetType() != null ? request.getFlowsheetType() : "STANDARD_SHIFT");
        flowsheet.setStatus("COMPLETED");
        flowsheet.setRecordedAt(OffsetDateTime.now());

        NursingFlowsheet savedFlowsheet = flowsheetRepository.save(flowsheet);

        if (request.getEntries() != null) {
            request.getEntries().forEach((key, value) -> {
                NursingFlowsheetEntry entry = new NursingFlowsheetEntry();
                entry.setFlowsheet(savedFlowsheet);
                entry.setItemKey(key);
                entry.setItemValue(value);
                flowsheetEntryRepository.save(entry);
            });
        }

        return mapToDTO(savedFlowsheet);
    }

    @Transactional(readOnly = true)
    public List<NursingFlowsheetResponseDTO> getEncounterFlowsheets(UUID encounterId) {
        return flowsheetRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public NursingFlowsheetResponseDTO addFlowsheetEntry(UUID flowsheetId, AddFlowsheetEntryRequest request) {
        NursingFlowsheet flowsheet = flowsheetRepository.findById(flowsheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Flowsheet not found with id: " + flowsheetId));

        NursingFlowsheetEntry entry = new NursingFlowsheetEntry();
        entry.setFlowsheet(flowsheet);
        entry.setItemKey(request.getItemKey());
        entry.setItemValue(request.getItemValue());
        flowsheetEntryRepository.save(entry);

        return mapToDTO(flowsheet);
    }

    @Transactional(readOnly = true)
    public List<NursingFlowsheetResponseDTO.EntryDTO> getFlowsheetEntries(UUID flowsheetId) {
        return flowsheetEntryRepository.findByFlowsheetId(flowsheetId).stream()
                .map(e -> new NursingFlowsheetResponseDTO.EntryDTO(e.getId(), e.getItemKey(), e.getItemValue()))
                .collect(Collectors.toList());
    }

    public NursingFlowsheetResponseDTO mapToDTO(NursingFlowsheet f) {
        NursingFlowsheetResponseDTO dto = new NursingFlowsheetResponseDTO();
        dto.setId(f.getId());
        if (f.getPatient() != null) dto.setPatientId(f.getPatient().getId());
        if (f.getEncounter() != null) dto.setEncounterId(f.getEncounter().getId());
        dto.setFlowsheetType(f.getFlowsheetType());
        dto.setStatus(f.getStatus());
        if (f.getRecordedBy() != null) dto.setRecordedByUsername(f.getRecordedBy().getUsername());
        dto.setRecordedAt(f.getRecordedAt());

        List<NursingFlowsheetEntry> entries = flowsheetEntryRepository.findByFlowsheetId(f.getId());
        dto.setEntries(entries.stream()
                .map(e -> new NursingFlowsheetResponseDTO.EntryDTO(e.getId(), e.getItemKey(), e.getItemValue()))
                .collect(Collectors.toList()));

        return dto;
    }
}
