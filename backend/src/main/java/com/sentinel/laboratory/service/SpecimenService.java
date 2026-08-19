package com.sentinel.laboratory.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.laboratory.entity.LabOrder;
import com.sentinel.laboratory.entity.Specimen;
import com.sentinel.laboratory.entity.SpecimenCollection;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.laboratory.dto.CreateSpecimenRequest;
import com.sentinel.laboratory.dto.SpecimenResponseDTO;
import com.sentinel.laboratory.dto.UpdateSpecimenRequest;
import com.sentinel.laboratory.repository.LabOrderRepository;
import com.sentinel.laboratory.repository.SpecimenCollectionRepository;
import com.sentinel.laboratory.repository.SpecimenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpecimenService {

    private final SpecimenRepository specimenRepository;
    private final SpecimenCollectionRepository specimenCollectionRepository;
    private final LabOrderRepository labOrderRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public SpecimenService(SpecimenRepository specimenRepository,
                           SpecimenCollectionRepository specimenCollectionRepository,
                           LabOrderRepository labOrderRepository,
                           UserRepository userRepository,
                           AuditService auditService) {
        this.specimenRepository = specimenRepository;
        this.specimenCollectionRepository = specimenCollectionRepository;
        this.labOrderRepository = labOrderRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public SpecimenResponseDTO createSpecimen(Long labOrderId, CreateSpecimenRequest request) {
        LabOrder order = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with id: " + labOrderId));

        Specimen specimen = new Specimen();
        specimen.setPatient(order.getPatient());
        specimen.setOrganization(order.getPatient() != null && order.getEncounter() != null ? order.getEncounter().getOrganization() : null);
        specimen.setSpecimenType(request.getSpecimenType());
        specimen.setAccessionNumber(request.getAccessionNumber() != null ? request.getAccessionNumber() : "ACC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        specimen.setBarcode(request.getBarcode() != null ? request.getBarcode() : "BAR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        specimen.setStatus("COLLECTED");
        specimen.setCollectedAt(request.getCollectedAt() != null ? request.getCollectedAt() : OffsetDateTime.now());

        if (order.getOrderingProvider() != null) {
            specimen.setCollectedBy(order.getOrderingProvider());
        }

        Specimen saved = specimenRepository.save(specimen);

        if (request.getCollectionMethod() != null || request.getCollectionSite() != null) {
            SpecimenCollection collection = new SpecimenCollection();
            collection.setSpecimen(saved);
            collection.setCollectionMethod(request.getCollectionMethod());
            collection.setCollectionSite(request.getCollectionSite());
            collection.setContainer(request.getContainer());
            collection.setCollectedAt(saved.getCollectedAt());
            collection.setCollectedBy(saved.getCollectedBy());
            specimenCollectionRepository.save(collection);
        }

        order.setStatus("SPECIMEN_COLLECTED");
        order.setSpecimenCollectedAt(java.time.LocalDateTime.now());
        order.setSpecimenBarcode(saved.getBarcode());
        labOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "SPECIMEN_COLLECTED", "Collected specimen " + saved.getSpecimenType() + " for order " + labOrderId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SpecimenResponseDTO> getOrderSpecimens(Long labOrderId) {
        LabOrder order = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with id: " + labOrderId));
        return specimenRepository.findByPatientId(order.getPatient().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpecimenResponseDTO getSpecimen(UUID specimenId) {
        Specimen specimen = specimenRepository.findById(specimenId)
                .orElseThrow(() -> new ResourceNotFoundException("Specimen not found with id: " + specimenId));
        return mapToDTO(specimen);
    }

    public SpecimenResponseDTO updateSpecimen(UUID specimenId, UpdateSpecimenRequest request) {
        Specimen specimen = specimenRepository.findById(specimenId)
                .orElseThrow(() -> new ResourceNotFoundException("Specimen not found with id: " + specimenId));

        if (request.getStatus() != null) specimen.setStatus(request.getStatus());
        if (request.getReceivedAt() != null) specimen.setReceivedAt(request.getReceivedAt());

        Specimen saved = specimenRepository.save(specimen);
        return mapToDTO(saved);
    }

    public SpecimenResponseDTO mapToDTO(Specimen s) {
        SpecimenResponseDTO dto = new SpecimenResponseDTO();
        dto.setId(s.getId());
        if (s.getPatient() != null) dto.setPatientId(s.getPatient().getId());
        dto.setSpecimenType(s.getSpecimenType());
        dto.setAccessionNumber(s.getAccessionNumber());
        dto.setBarcode(s.getBarcode());
        dto.setStatus(s.getStatus());
        dto.setCollectedAt(s.getCollectedAt());
        dto.setReceivedAt(s.getReceivedAt());
        if (s.getCollectedBy() != null) dto.setCollectedByEmail(s.getCollectedBy().getEmail());
        return dto;
    }
}
