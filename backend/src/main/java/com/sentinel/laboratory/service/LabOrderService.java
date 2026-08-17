package com.sentinel.laboratory.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.laboratory.entity.LabOrder;
import com.sentinel.laboratory.entity.LabOrderItem;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.laboratory.dto.CreateLabOrderRequest;
import com.sentinel.laboratory.dto.LabOrderResponseDTO;
import com.sentinel.laboratory.dto.UpdateLabOrderRequest;
import com.sentinel.laboratory.repository.LabOrderItemRepository;
import com.sentinel.laboratory.repository.LabOrderRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LabOrderService {

    private final LabOrderRepository labOrderRepository;
    private final LabOrderItemRepository labOrderItemRepository;
    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public LabOrderService(LabOrderRepository labOrderRepository,
                           LabOrderItemRepository labOrderItemRepository,
                           EncounterRepository encounterRepository,
                           PatientRepository patientRepository,
                           UserRepository userRepository,
                           AuditService auditService) {
        this.labOrderRepository = labOrderRepository;
        this.labOrderItemRepository = labOrderItemRepository;
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public LabOrderResponseDTO createLabOrder(UUID encounterId, CreateLabOrderRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        LabOrder order = new LabOrder();
        order.setEncounter(encounter);
        order.setPatient(encounter.getPatient());
        order.setOrderingProvider(encounter.getCreatedBy());
        order.setTestName(request.getTestName());
        order.setLoincCode(request.getLoincCode());
        order.setCategory(request.getCategory() != null ? request.getCategory() : "LABORATORY");
        order.setClinicalNotes(request.getClinicalNotes());
        order.setStatus("ORDERED");
        order.setOrderedAt(LocalDateTime.now());

        LabOrder saved = labOrderRepository.save(order);

        if (request.getTestCodes() != null) {
            for (String code : request.getTestCodes()) {
                LabOrderItem item = new LabOrderItem();
                item.setLabOrder(saved);
                item.setTestCode(code);
                item.setTestName(request.getTestName());
                item.setStatus("ORDERED");
                labOrderItemRepository.save(item);
            }
        }

        if (auditService != null) {
            auditService.logEvent(UUID.nameUUIDFromBytes(String.valueOf(saved.getId()).getBytes()), "LAB_ORDER_CREATED", "Ordered " + saved.getTestName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LabOrderResponseDTO> getAllLabOrders(String status, String search) {
        List<LabOrder> orders;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            orders = labOrderRepository.findByStatusOrderByOrderedAtDesc(status);
        } else {
            orders = labOrderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderedAt"));
        }

        if (search != null && !search.isBlank()) {
            String lowerSearch = search.toLowerCase();
            orders = orders.stream().filter(o -> {
                boolean matchTest = o.getTestName() != null && o.getTestName().toLowerCase().contains(lowerSearch);
                boolean matchLoinc = o.getLoincCode() != null && o.getLoincCode().toLowerCase().contains(lowerSearch);
                boolean matchBarcode = o.getSpecimenBarcode() != null && o.getSpecimenBarcode().toLowerCase().contains(lowerSearch);
                boolean matchId = String.valueOf(o.getId()).contains(lowerSearch);
                boolean matchPatient = false;
                if (o.getPatient() != null && o.getPatient().getPerson() != null) {
                    String fn = o.getPatient().getPerson().getFirstName() != null ? o.getPatient().getPerson().getFirstName().toLowerCase() : "";
                    String ln = o.getPatient().getPerson().getLastName() != null ? o.getPatient().getPerson().getLastName().toLowerCase() : "";
                    matchPatient = fn.contains(lowerSearch) || ln.contains(lowerSearch) || (fn + " " + ln).contains(lowerSearch);
                }
                return matchTest || matchLoinc || matchBarcode || matchId || matchPatient;
            }).collect(Collectors.toList());
        }

        return orders.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabOrderResponseDTO> getEncounterOrders(UUID encounterId) {
        return labOrderRepository.findByEncounterIdOrderByOrderedAtDesc(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabOrderResponseDTO> getPatientOrders(UUID patientId) {
        return labOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LabOrderResponseDTO getLabOrder(Long orderId) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with id: " + orderId));
        return mapToDTO(order);
    }

    public LabOrderResponseDTO updateLabOrder(Long orderId, UpdateLabOrderRequest request) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with id: " + orderId));

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
            if ("SPECIMEN_COLLECTED".equalsIgnoreCase(request.getStatus()) || "COLLECTED".equalsIgnoreCase(request.getStatus())) {
                if (order.getSpecimenCollectedAt() == null) {
                    order.setSpecimenCollectedAt(LocalDateTime.now());
                }
            } else if ("IN_PROCESS".equalsIgnoreCase(request.getStatus()) || "IN_ANALYSIS".equalsIgnoreCase(request.getStatus())) {
                if (order.getInProcessAt() == null) {
                    order.setInProcessAt(LocalDateTime.now());
                }
            } else if ("RESULTED".equalsIgnoreCase(request.getStatus()) || "COMPLETED".equalsIgnoreCase(request.getStatus())) {
                if (order.getResultedAt() == null) {
                    order.setResultedAt(LocalDateTime.now());
                }
            } else if ("VERIFIED".equalsIgnoreCase(request.getStatus())) {
                if (order.getReviewedAt() == null) {
                    order.setReviewedAt(LocalDateTime.now());
                }
            }
        }
        if (request.getSpecimenBarcode() != null) order.setSpecimenBarcode(request.getSpecimenBarcode());
        if (request.getClinicalNotes() != null) order.setClinicalNotes(request.getClinicalNotes());

        LabOrder saved = labOrderRepository.save(order);
        return mapToDTO(saved);
    }

    public LabOrderResponseDTO cancelLabOrder(Long orderId) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with id: " + orderId));

        order.setStatus("CANCELLED");
        LabOrder saved = labOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(UUID.nameUUIDFromBytes(String.valueOf(saved.getId()).getBytes()), "LAB_ORDER_CANCELLED", "Cancelled order " + orderId);
        }

        return mapToDTO(saved);
    }

    public LabOrderResponseDTO mapToDTO(LabOrder o) {
        LabOrderResponseDTO dto = new LabOrderResponseDTO();
        dto.setId(o.getId());
        if (o.getPatient() != null) {
            dto.setPatientId(o.getPatient().getId());
            if (o.getPatient().getPerson() != null) {
                String first = o.getPatient().getPerson().getFirstName() != null ? o.getPatient().getPerson().getFirstName() : "";
                String last = o.getPatient().getPerson().getLastName() != null ? o.getPatient().getPerson().getLastName() : "";
                dto.setPatientFullName((first + " " + last).trim());
                if (o.getPatient().getPerson().getDateOfBirth() != null) {
                    dto.setPatientBirthDate(o.getPatient().getPerson().getDateOfBirth().toString());
                }
                dto.setPatientGender(o.getPatient().getPerson().getSexAtBirth());
            }
            dto.setPatientMrn(o.getPatient().getId() != null ? "MRN-" + o.getPatient().getId().toString().substring(0, 8).toUpperCase() : null);
        }
        if (o.getEncounter() != null) dto.setEncounterId(o.getEncounter().getId());
        if (o.getOrderingProvider() != null) dto.setOrderingProviderUsername(o.getOrderingProvider().getUsername());
        dto.setTestName(o.getTestName());
        dto.setLoincCode(o.getLoincCode());
        dto.setCategory(o.getCategory());
        dto.setStatus(o.getStatus());
        dto.setSpecimenBarcode(o.getSpecimenBarcode());
        dto.setOrderedAt(o.getOrderedAt());
        dto.setSpecimenCollectedAt(o.getSpecimenCollectedAt());
        dto.setInProcessAt(o.getInProcessAt());
        dto.setResultedAt(o.getResultedAt());
        dto.setReviewedAt(o.getReviewedAt());
        if (o.getReviewedBy() != null) dto.setReviewedByUsername(o.getReviewedBy().getUsername());
        dto.setClinicalNotes(o.getClinicalNotes());

        // Determine priority from clinical notes / test name
        if (o.getClinicalNotes() != null && o.getClinicalNotes().toUpperCase().contains("STAT")) {
            dto.setPriority("STAT");
        } else if (o.getTestName() != null && (o.getTestName().toUpperCase().contains("STAT") || o.getTestName().toUpperCase().contains("TROPONIN") || o.getTestName().toUpperCase().contains("BLOOD GAS"))) {
            dto.setPriority("STAT");
        } else if (o.getClinicalNotes() != null && o.getClinicalNotes().toUpperCase().contains("URGENT")) {
            dto.setPriority("URGENT");
        } else {
            dto.setPriority("ROUTINE");
        }

        List<LabOrderItem> items = labOrderItemRepository.findByLabOrderId(o.getId());
        dto.setItems(items.stream().map(i -> new LabOrderResponseDTO.LabOrderItemDTO(
                i.getId(), i.getTestCode(), i.getTestName(), i.getStatus()
        )).collect(Collectors.toList()));

        return dto;
    }
}
