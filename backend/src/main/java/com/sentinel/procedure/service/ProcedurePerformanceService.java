package com.sentinel.procedure.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.procedure.entity.ProcedureOrder;
import com.sentinel.procedure.entity.ProcedureParticipant;
import com.sentinel.procedure.entity.ProcedurePerformance;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.procedure.dto.AddProcedureParticipantRequest;
import com.sentinel.procedure.dto.PerformProcedureRequest;
import com.sentinel.procedure.dto.ProcedureParticipantResponseDTO;
import com.sentinel.procedure.dto.ProcedurePerformanceResponseDTO;
import com.sentinel.procedure.repository.ProcedureOrderRepository;
import com.sentinel.procedure.repository.ProcedureParticipantRepository;
import com.sentinel.procedure.repository.ProcedurePerformanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProcedurePerformanceService {

    private final ProcedurePerformanceRepository procedurePerformanceRepository;
    private final ProcedureParticipantRepository procedureParticipantRepository;
    private final ProcedureOrderRepository procedureOrderRepository;
    private final PractitionerRepository practitionerRepository;
    private final AuditService auditService;

    public ProcedurePerformanceService(ProcedurePerformanceRepository procedurePerformanceRepository,
                                       ProcedureParticipantRepository procedureParticipantRepository,
                                       ProcedureOrderRepository procedureOrderRepository,
                                       PractitionerRepository practitionerRepository,
                                       AuditService auditService) {
        this.procedurePerformanceRepository = procedurePerformanceRepository;
        this.procedureParticipantRepository = procedureParticipantRepository;
        this.procedureOrderRepository = procedureOrderRepository;
        this.practitionerRepository = practitionerRepository;
        this.auditService = auditService;
    }

    public ProcedurePerformanceResponseDTO performProcedure(Long orderId, PerformProcedureRequest request) {
        ProcedureOrder order = procedureOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure order not found with id: " + orderId));

        ProcedurePerformance perf = new ProcedurePerformance();
        perf.setProcedureOrder(order);
        perf.setPatient(order.getPatient());
        perf.setEncounter(order.getEncounter());
        perf.setOrganization(order.getEncounter() != null ? order.getEncounter().getOrganization() : null);
        perf.setStatus("COMPLETED");
        perf.setFindings(request.getFindings());
        perf.setComplications(request.getComplications());
        perf.setPerformedAt(request.getPerformedAt() != null ? request.getPerformedAt() : OffsetDateTime.now());

        ProcedurePerformance saved = procedurePerformanceRepository.save(perf);

        order.setStatus("PERFORMED");
        order.setPerformedAt(java.time.LocalDateTime.now());
        if (request.getFindings() != null) order.setOperativeReport(request.getFindings());
        procedureOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PROCEDURE_PERFORMED", "Performed procedure for order " + orderId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ProcedurePerformanceResponseDTO> getOrderPerformances(Long orderId) {
        return procedurePerformanceRepository.findByProcedureOrderId(orderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProcedurePerformanceResponseDTO getPerformance(UUID performanceId) {
        ProcedurePerformance perf = procedurePerformanceRepository.findById(performanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure performance not found with id: " + performanceId));
        return mapToDTO(perf);
    }

    public ProcedureParticipantResponseDTO addParticipant(UUID performanceId, AddProcedureParticipantRequest request) {
        ProcedurePerformance perf = procedurePerformanceRepository.findById(performanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure performance not found with id: " + performanceId));

        Practitioner practitioner = practitionerRepository.findById(request.getPractitionerId())
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + request.getPractitionerId()));

        ProcedureParticipant participant = new ProcedureParticipant();
        participant.setPerformance(perf);
        participant.setPractitioner(practitioner);
        participant.setRole(request.getRole());

        ProcedureParticipant saved = procedureParticipantRepository.save(participant);
        return mapParticipantToDTO(saved);
    }

    public ProcedurePerformanceResponseDTO mapToDTO(ProcedurePerformance p) {
        ProcedurePerformanceResponseDTO dto = new ProcedurePerformanceResponseDTO();
        dto.setId(p.getId());
        if (p.getPatient() != null) dto.setPatientId(p.getPatient().getId());
        if (p.getEncounter() != null) dto.setEncounterId(p.getEncounter().getId());
        if (p.getProcedureOrder() != null) dto.setProcedureOrderId(p.getProcedureOrder().getId());
        if (p.getPerformedBy() != null && p.getPerformedBy().getPerson() != null) {
            dto.setPerformedByName(p.getPerformedBy().getPerson().getFullName());
        }
        dto.setPerformedAt(p.getPerformedAt());
        dto.setStatus(p.getStatus());
        dto.setFindings(p.getFindings());
        dto.setComplications(p.getComplications());
        return dto;
    }

    public ProcedureParticipantResponseDTO mapParticipantToDTO(ProcedureParticipant p) {
        ProcedureParticipantResponseDTO dto = new ProcedureParticipantResponseDTO();
        dto.setId(p.getId());
        if (p.getPerformance() != null) dto.setPerformanceId(p.getPerformance().getId());
        if (p.getPractitioner() != null) {
            dto.setPractitionerId(p.getPractitioner().getId());
            if (p.getPractitioner().getPerson() != null) {
                dto.setPractitionerName(p.getPractitioner().getPerson().getFullName());
            }
        }
        dto.setRole(p.getRole());
        return dto;
    }
}
