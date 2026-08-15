package com.sentinel.encounters.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.entity.LabOrder;
import com.sentinel.vitals.entity.LabResult;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.encounters.repository.LabOrderRepository;
import com.sentinel.vitals.repository.LabResultRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LabOrderService {

    private final LabOrderRepository labOrderRepository;
    private final LabResultRepository labResultRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditTrailService;

    public LabOrderService(LabOrderRepository labOrderRepository,
                           LabResultRepository labResultRepository,
                           PatientRepository patientRepository,
                           EncounterRepository encounterRepository,
                           UserRepository userRepository,
                           AuditTrailService auditTrailService) {
        this.labOrderRepository = labOrderRepository;
        this.labResultRepository = labResultRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.userRepository = userRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional(readOnly = true)
    public List<LabOrder> getOrdersByPatient(Long patientId) {
        return labOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<LabOrder> getOrdersByEncounter(Long encounterId) {
        return labOrderRepository.findByEncounterIdOrderByOrderedAtDesc(encounterId);
    }

    @Transactional(readOnly = true)
    public List<LabOrder> getAllOrders() {
        return labOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<LabOrder> getOrderById(Long id) {
        return labOrderRepository.findById(id);
    }

    @Transactional
    public LabOrder createOrder(Long patientId, Long encounterId, String testName, String loincCode, String notes, String username) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + patientId + " not found"));

        User orderingProvider = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User " + username + " not found"));

        Encounter encounter = encounterId != null ? encounterRepository.findById(encounterId).orElse(null) : null;

        LabOrder order = new LabOrder(patient, encounter, orderingProvider, testName, loincCode, notes);
        LabOrder saved = labOrderRepository.save(order);

        auditTrailService.logAction(username, "CREATE_LAB_ORDER", "LAB_ORDER", saved.getId().toString(), "Placed lab order: " + testName);
        return saved;
    }

    @Transactional
    public LabOrder updateStatus(Long orderId, String newStatus, String barcode, String username) {
        LabOrder order = labOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order with ID " + orderId + " not found"));

        order.setStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();

        if ("SPECIMEN_COLLECTED".equalsIgnoreCase(newStatus)) {
            order.setSpecimenCollectedAt(now);
            if (barcode != null) order.setSpecimenBarcode(barcode);
        } else if ("IN_PROCESS".equalsIgnoreCase(newStatus)) {
            order.setInProcessAt(now);
        } else if ("RESULTED".equalsIgnoreCase(newStatus)) {
            order.setResultedAt(now);
        } else if ("CLINICIAN_REVIEWED".equalsIgnoreCase(newStatus)) {
            order.setReviewedAt(now);
            User reviewer = userRepository.findByUsername(username).orElse(null);
            order.setReviewedBy(reviewer);
        }

        LabOrder saved = labOrderRepository.save(order);
        auditTrailService.logAction(username, "UPDATE_LAB_STATUS", "LAB_ORDER", orderId.toString(), "Updated lab order status to " + newStatus);
        return saved;
    }

    @Transactional
    public LabResult addResult(Long labOrderId, LabResult result, String username) {
        LabOrder order = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order with ID " + labOrderId + " not found"));

        result.setLabOrder(order);
        LabResult saved = labResultRepository.save(result);

        order.setStatus("RESULTED");
        order.setResultedAt(LocalDateTime.now());
        labOrderRepository.save(order);

        auditTrailService.logAction(username, "ADD_LAB_RESULT", "LAB_RESULT", saved.getId().toString(), "Added lab result for " + result.getParameterName() + ": " + result.getResultValue() + " " + (result.getUnit() != null ? result.getUnit() : ""));
        return saved;
    }
}
