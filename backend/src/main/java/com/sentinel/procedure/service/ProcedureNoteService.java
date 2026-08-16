package com.sentinel.procedure.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.procedure.entity.ProcedureNote;
import com.sentinel.procedure.entity.ProcedurePerformance;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.procedure.dto.CreateProcedureNoteRequest;
import com.sentinel.procedure.dto.ProcedureNoteResponseDTO;
import com.sentinel.procedure.repository.ProcedureNoteRepository;
import com.sentinel.procedure.repository.ProcedurePerformanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProcedureNoteService {

    private final ProcedureNoteRepository procedureNoteRepository;
    private final ProcedurePerformanceRepository procedurePerformanceRepository;
    private final AuditService auditService;

    public ProcedureNoteService(ProcedureNoteRepository procedureNoteRepository,
                                ProcedurePerformanceRepository procedurePerformanceRepository,
                                AuditService auditService) {
        this.procedureNoteRepository = procedureNoteRepository;
        this.procedurePerformanceRepository = procedurePerformanceRepository;
        this.auditService = auditService;
    }

    public ProcedureNoteResponseDTO createNote(UUID performanceId, CreateProcedureNoteRequest request) {
        ProcedurePerformance perf = procedurePerformanceRepository.findById(performanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure performance not found with id: " + performanceId));

        ProcedureNote note = new ProcedureNote();
        note.setPerformance(perf);
        note.setNoteType(request.getNoteType() != null ? request.getNoteType() : "OPERATIVE_NOTE");
        note.setContent(request.getContent());
        note.setCreatedAt(OffsetDateTime.now());

        ProcedureNote saved = procedureNoteRepository.save(note);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PROCEDURE_NOTE_CREATED", "Added note to procedure performance " + performanceId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ProcedureNoteResponseDTO> getPerformanceNotes(UUID performanceId) {
        return procedureNoteRepository.findByPerformanceIdOrderByCreatedAtDesc(performanceId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProcedureNoteResponseDTO mapToDTO(ProcedureNote n) {
        ProcedureNoteResponseDTO dto = new ProcedureNoteResponseDTO();
        dto.setId(n.getId());
        if (n.getPerformance() != null) dto.setPerformanceId(n.getPerformance().getId());
        dto.setNoteType(n.getNoteType());
        dto.setContent(n.getContent());
        if (n.getCreatedBy() != null) dto.setCreatedByUsername(n.getCreatedBy().getUsername());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
