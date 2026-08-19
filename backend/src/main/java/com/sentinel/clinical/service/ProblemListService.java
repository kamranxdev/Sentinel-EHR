package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.AddProblemRequest;
import com.sentinel.clinical.dto.ProblemListResponseDTO;
import com.sentinel.clinical.dto.ResolveProblemRequest;
import com.sentinel.clinical.dto.UpdateProblemRequest;
import com.sentinel.clinical.entity.ProblemList;
import com.sentinel.clinical.repository.ProblemListRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProblemListService {

    private final ProblemListRepository problemListRepository;
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;

    public ProblemListService(ProblemListRepository problemListRepository,
                              PatientRepository patientRepository,
                              PatientOrganizationRepository patientOrganizationRepository) {
        this.problemListRepository = problemListRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
    }

    @Transactional(readOnly = true)
    public List<ProblemListResponseDTO> getProblemList(UUID patientId) {
        return problemListRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProblemListResponseDTO addProblem(UUID patientId, AddProblemRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        ProblemList problem = new ProblemList();
        problem.setPatient(patient);

        List<PatientOrganization> pos = patientOrganizationRepository.findByPatientId(patientId);
        if (!pos.isEmpty()) {
            problem.setOrganization(pos.get(0).getOrganization());
        }

        problem.setCodeSystem(request.getCodeSystem() != null ? request.getCodeSystem() : "ICD-10");
        problem.setCode(request.getCode());
        problem.setProblemName(request.getProblemName());
        problem.setStatus("ACTIVE");
        problem.setOnsetDate(request.getOnsetDate() != null ? request.getOnsetDate() : LocalDate.now());
        problem.setNotes(request.getNotes());
        problem.setRecordedAt(OffsetDateTime.now());

        ProblemList saved = problemListRepository.save(problem);
        return mapToDTO(saved);
    }

    public ProblemListResponseDTO updateProblem(UUID problemId, UpdateProblemRequest request) {
        ProblemList problem = problemListRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        if (request.getProblemName() != null) problem.setProblemName(request.getProblemName());
        if (request.getStatus() != null) problem.setStatus(request.getStatus());
        if (request.getOnsetDate() != null) problem.setOnsetDate(request.getOnsetDate());
        if (request.getResolvedDate() != null) problem.setResolvedDate(request.getResolvedDate());
        if (request.getNotes() != null) problem.setNotes(request.getNotes());

        ProblemList saved = problemListRepository.save(problem);
        return mapToDTO(saved);
    }

    public ProblemListResponseDTO resolveProblem(UUID problemId, ResolveProblemRequest request) {
        ProblemList problem = problemListRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        problem.setStatus("RESOLVED");
        problem.setResolvedDate(request != null && request.getResolvedDate() != null ? request.getResolvedDate() : LocalDate.now());
        if (request != null && request.getNotes() != null) {
            problem.setNotes((problem.getNotes() != null ? problem.getNotes() + "\n" : "") + "Resolution note: " + request.getNotes());
        }

        ProblemList saved = problemListRepository.save(problem);
        return mapToDTO(saved);
    }

    public ProblemListResponseDTO mapToDTO(ProblemList p) {
        ProblemListResponseDTO dto = new ProblemListResponseDTO();
        dto.setId(p.getId());
        if (p.getPatient() != null) dto.setPatientId(p.getPatient().getId());
        if (p.getOrganization() != null) dto.setOrganizationId(p.getOrganization().getId());
        dto.setCodeSystem(p.getCodeSystem());
        dto.setCode(p.getCode());
        dto.setProblemName(p.getProblemName());
        dto.setStatus(p.getStatus());
        dto.setOnsetDate(p.getOnsetDate());
        dto.setResolvedDate(p.getResolvedDate());
        dto.setNotes(p.getNotes());
        if (p.getRecordedBy() != null) dto.setRecordedByEmail(p.getRecordedBy().getEmail());
        dto.setRecordedAt(p.getRecordedAt());
        return dto;
    }
}
