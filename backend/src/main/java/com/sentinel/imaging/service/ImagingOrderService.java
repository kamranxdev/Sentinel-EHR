package com.sentinel.imaging.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.imaging.entity.ImagingOrder;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.imaging.dto.CreateImagingOrderRequest;
import com.sentinel.imaging.dto.ImagingOrderResponseDTO;
import com.sentinel.imaging.dto.UpdateImagingOrderRequest;
import com.sentinel.imaging.repository.ImagingOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ImagingOrderService {

    private final ImagingOrderRepository imagingOrderRepository;
    private final EncounterRepository encounterRepository;
    private final AuditService auditService;

    public ImagingOrderService(ImagingOrderRepository imagingOrderRepository,
                               EncounterRepository encounterRepository,
                               AuditService auditService) {
        this.imagingOrderRepository = imagingOrderRepository;
        this.encounterRepository = encounterRepository;
        this.auditService = auditService;
    }

    public ImagingOrderResponseDTO createImagingOrder(UUID encounterId, CreateImagingOrderRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        ImagingOrder order = new ImagingOrder();
        order.setEncounter(encounter);
        order.setPatient(encounter.getPatient());
        order.setOrderingProvider(encounter.getCreatedBy());
        order.setModality(request.getModality());
        order.setProcedureName(request.getProcedureName());
        order.setCptCode(request.getCptCode());
        order.setStatus("ORDERED");
        order.setOrderedAt(LocalDateTime.now());
        order.setScheduledAt(request.getScheduledAt());

        ImagingOrder saved = imagingOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(UUID.nameUUIDFromBytes(String.valueOf(saved.getId()).getBytes()), "IMAGING_ORDER_CREATED", "Ordered " + saved.getProcedureName() + " (" + saved.getModality() + ")");
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ImagingOrderResponseDTO> getEncounterOrders(UUID encounterId) {
        return imagingOrderRepository.findByEncounterIdOrderByOrderedAtDesc(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ImagingOrderResponseDTO> getPatientOrders(UUID patientId) {
        return imagingOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ImagingOrderResponseDTO getImagingOrder(Long orderId) {
        ImagingOrder order = imagingOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging order not found with id: " + orderId));
        return mapToDTO(order);
    }

    public ImagingOrderResponseDTO updateImagingOrder(Long orderId, UpdateImagingOrderRequest request) {
        ImagingOrder order = imagingOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging order not found with id: " + orderId));

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
            if ("PERFORMED".equalsIgnoreCase(request.getStatus())) {
                order.setPerformedAt(LocalDateTime.now());
            } else if ("REPORT_GENERATED".equalsIgnoreCase(request.getStatus())) {
                order.setReportGeneratedAt(LocalDateTime.now());
            }
        }
        if (request.getDicomStudyInstanceUid() != null) order.setDicomStudyInstanceUid(request.getDicomStudyInstanceUid());
        if (request.getRadiologistReport() != null) order.setRadiologistReport(request.getRadiologistReport());
        if (request.getScheduledAt() != null) order.setScheduledAt(request.getScheduledAt());
        if (request.getPerformedAt() != null) order.setPerformedAt(request.getPerformedAt());

        ImagingOrder saved = imagingOrderRepository.save(order);
        return mapToDTO(saved);
    }

    public ImagingOrderResponseDTO cancelImagingOrder(Long orderId) {
        ImagingOrder order = imagingOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging order not found with id: " + orderId));

        order.setStatus("CANCELLED");
        ImagingOrder saved = imagingOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(UUID.nameUUIDFromBytes(String.valueOf(saved.getId()).getBytes()), "IMAGING_ORDER_CANCELLED", "Cancelled imaging order " + orderId);
        }

        return mapToDTO(saved);
    }

    public ImagingOrderResponseDTO mapToDTO(ImagingOrder o) {
        ImagingOrderResponseDTO dto = new ImagingOrderResponseDTO();
        dto.setId(o.getId());
        if (o.getPatient() != null) dto.setPatientId(o.getPatient().getId());
        if (o.getEncounter() != null) dto.setEncounterId(o.getEncounter().getId());
        if (o.getOrderingProvider() != null) dto.setOrderingProviderUsername(o.getOrderingProvider().getUsername());
        dto.setModality(o.getModality());
        dto.setProcedureName(o.getProcedureName());
        dto.setCptCode(o.getCptCode());
        dto.setStatus(o.getStatus());
        dto.setDicomStudyInstanceUid(o.getDicomStudyInstanceUid());
        dto.setRadiologistReport(o.getRadiologistReport());
        if (o.getRadiologist() != null) dto.setRadiologistUsername(o.getRadiologist().getUsername());
        dto.setOrderedAt(o.getOrderedAt());
        dto.setScheduledAt(o.getScheduledAt());
        dto.setPerformedAt(o.getPerformedAt());
        dto.setReportGeneratedAt(o.getReportGeneratedAt());
        dto.setReviewedAt(o.getReviewedAt());
        return dto;
    }
}
