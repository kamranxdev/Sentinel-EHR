package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.AddDiagnosisRequest;
import com.sentinel.clinical.dto.DiagnosisResponseDTO;
import com.sentinel.clinical.dto.ResolveDiagnosisRequest;
import com.sentinel.clinical.dto.UpdateDiagnosisRequest;
import com.sentinel.clinical.entity.Diagnosis;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.DiagnosisRepository;
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
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final EncounterRepository encounterRepository;

    public DiagnosisService(DiagnosisRepository diagnosisRepository, EncounterRepository encounterRepository) {
        this.diagnosisRepository = diagnosisRepository;
        this.encounterRepository = encounterRepository;
    }

    public DiagnosisResponseDTO addDiagnosis(UUID encounterId, AddDiagnosisRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setPatient(encounter.getPatient());
        diagnosis.setConditionName(request.getConditionName());
        diagnosis.setIcdCode(request.getIcdCode());
        diagnosis.setSnomedCode(request.getSnomedCode());
        diagnosis.setStatus("active");
        diagnosis.setOnsetDate(request.getOnsetDate() != null ? request.getOnsetDate() : OffsetDateTime.now());
        diagnosis.setNotes(request.getNotes());
        diagnosis.setRecordedAt(OffsetDateTime.now());
        diagnosis.setCreatedAt(OffsetDateTime.now());
        diagnosis.setUpdatedAt(OffsetDateTime.now());

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DiagnosisResponseDTO> getEncounterDiagnoses(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        return diagnosisRepository.findByPatientId(encounter.getPatient().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DiagnosisResponseDTO updateDiagnosis(UUID diagnosisId, UpdateDiagnosisRequest request) {
        Diagnosis diagnosis = diagnosisRepository.findById(diagnosisId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis not found with id: " + diagnosisId));

        if (request.getConditionName() != null) diagnosis.setConditionName(request.getConditionName());
        if (request.getIcdCode() != null) diagnosis.setIcdCode(request.getIcdCode());
        if (request.getSnomedCode() != null) diagnosis.setSnomedCode(request.getSnomedCode());
        if (request.getStatus() != null) diagnosis.setStatus(request.getStatus());
        if (request.getOnsetDate() != null) diagnosis.setOnsetDate(request.getOnsetDate());
        if (request.getNotes() != null) diagnosis.setNotes(request.getNotes());
        diagnosis.setUpdatedAt(OffsetDateTime.now());

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        return mapToDTO(saved);
    }

    public DiagnosisResponseDTO resolveDiagnosis(UUID diagnosisId, ResolveDiagnosisRequest request) {
        Diagnosis diagnosis = diagnosisRepository.findById(diagnosisId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis not found with id: " + diagnosisId));

        diagnosis.setStatus("resolved");
        if (request != null && request.getNotes() != null) {
            diagnosis.setNotes((diagnosis.getNotes() != null ? diagnosis.getNotes() + "\n" : "") + "Resolution note: " + request.getNotes());
        }
        diagnosis.setUpdatedAt(OffsetDateTime.now());

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        return mapToDTO(saved);
    }

    public DiagnosisResponseDTO mapToDTO(Diagnosis d) {
        DiagnosisResponseDTO dto = new DiagnosisResponseDTO();
        dto.setId(d.getId());
        if (d.getPatient() != null) dto.setPatientId(d.getPatient().getId());
        dto.setConditionName(d.getConditionName());
        dto.setIcdCode(d.getIcdCode());
        dto.setSnomedCode(d.getSnomedCode());
        dto.setStatus(d.getStatus());
        dto.setOnsetDate(d.getOnsetDate());
        dto.setNotes(d.getNotes());
        if (d.getDoctor() != null) dto.setDoctorUsername(d.getDoctor().getUsername());
        dto.setRecordedAt(d.getRecordedAt());
        dto.setCreatedAt(d.getCreatedAt());
        dto.setUpdatedAt(d.getUpdatedAt());
        return dto;
    }
}
