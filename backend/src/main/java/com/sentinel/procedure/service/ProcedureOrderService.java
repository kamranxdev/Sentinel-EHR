package com.sentinel.procedure.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.procedure.entity.ProcedureOrder;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.procedure.dto.CreateProcedureOrderRequest;
import com.sentinel.procedure.dto.ProcedureOrderResponseDTO;
import com.sentinel.procedure.dto.UpdateProcedureOrderRequest;
import com.sentinel.procedure.repository.ProcedureOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProcedureOrderService {

    private final ProcedureOrderRepository procedureOrderRepository;
    private final EncounterRepository encounterRepository;
    private final AuditService auditService;

    public ProcedureOrderService(ProcedureOrderRepository procedureOrderRepository,
                                 EncounterRepository encounterRepository,
                                 AuditService auditService) {
        this.procedureOrderRepository = procedureOrderRepository;
        this.encounterRepository = encounterRepository;
        this.auditService = auditService;
    }

    public ProcedureOrderResponseDTO createProcedureOrder(UUID encounterId, CreateProcedureOrderRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        ProcedureOrder order = new ProcedureOrder();
        order.setEncounter(encounter);
        order.setPatient(encounter.getPatient());
        order.setOrderingProvider(encounter.getCreatedBy());
        order.setProcedureName(request.getProcedureName());
        order.setSnomedCode(request.getSnomedCode());
        order.setCptCode(request.getCptCode());
        order.setStatus("ORDERED");
        order.setOrderedAt(LocalDateTime.now());
        order.setScheduledAt(request.getScheduledAt());

        ProcedureOrder saved = procedureOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(UUID.nameUUIDFromBytes(String.valueOf(saved.getId()).getBytes()), "PROCEDURE_ORDER_CREATED", "Ordered " + saved.getProcedureName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ProcedureOrderResponseDTO> getEncounterOrders(UUID encounterId) {
        return procedureOrderRepository.findByEncounterIdOrderByOrderedAtDesc(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProcedureOrderResponseDTO> getPatientOrders(UUID patientId) {
        return procedureOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProcedureOrderResponseDTO getProcedureOrder(Long orderId) {
        ProcedureOrder order = procedureOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure order not found with id: " + orderId));
        return mapToDTO(order);
    }

    public ProcedureOrderResponseDTO updateProcedureOrder(Long orderId, UpdateProcedureOrderRequest request) {
        ProcedureOrder order = procedureOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure order not found with id: " + orderId));

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
            if ("PERFORMED".equalsIgnoreCase(request.getStatus())) {
                order.setPerformedAt(LocalDateTime.now());
            }
        }
        if (request.getOperativeReport() != null) {
            order.setOperativeReport(request.getOperativeReport());
            order.setDocumentedAt(LocalDateTime.now());
        }
        if (request.getScheduledAt() != null) order.setScheduledAt(request.getScheduledAt());
        if (request.getPerformedAt() != null) order.setPerformedAt(request.getPerformedAt());

        ProcedureOrder saved = procedureOrderRepository.save(order);
        return mapToDTO(saved);
    }

    public ProcedureOrderResponseDTO mapToDTO(ProcedureOrder o) {
        ProcedureOrderResponseDTO dto = new ProcedureOrderResponseDTO();
        dto.setId(o.getId());
        if (o.getPatient() != null) dto.setPatientId(o.getPatient().getId());
        if (o.getEncounter() != null) dto.setEncounterId(o.getEncounter().getId());
        if (o.getOrderingProvider() != null) dto.setOrderingProviderUsername(o.getOrderingProvider().getUsername());
        dto.setProcedureName(o.getProcedureName());
        dto.setSnomedCode(o.getSnomedCode());
        dto.setCptCode(o.getCptCode());
        dto.setStatus(o.getStatus());
        dto.setOperativeReport(o.getOperativeReport());
        if (o.getProceduralist() != null) dto.setProceduralistUsername(o.getProceduralist().getUsername());
        dto.setOrderedAt(o.getOrderedAt());
        dto.setScheduledAt(o.getScheduledAt());
        dto.setPerformedAt(o.getPerformedAt());
        dto.setDocumentedAt(o.getDocumentedAt());
        return dto;
    }
}
