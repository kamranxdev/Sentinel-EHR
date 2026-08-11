package com.sentinel.clinicalrecords.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinicalrecords.entity.ProcedureOrder;
import com.sentinel.clinicalrecords.repository.ProcedureOrderRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
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
public class ProcedureOrderService {

    private final ProcedureOrderRepository procedureOrderRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditTrailService;

    public ProcedureOrderService(ProcedureOrderRepository procedureOrderRepository,
                                 PatientRepository patientRepository,
                                 EncounterRepository encounterRepository,
                                 UserRepository userRepository,
                                 AuditTrailService auditTrailService) {
        this.procedureOrderRepository = procedureOrderRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.userRepository = userRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional(readOnly = true)
    public List<ProcedureOrder> getOrdersByPatient(Long patientId) {
        return procedureOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<ProcedureOrder> getOrdersByEncounter(Long encounterId) {
        return procedureOrderRepository.findByEncounterIdOrderByOrderedAtDesc(encounterId);
    }

    @Transactional(readOnly = true)
    public List<ProcedureOrder> getAllOrders() {
        return procedureOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<ProcedureOrder> getOrderById(Long id) {
        return procedureOrderRepository.findById(id);
    }

    @Transactional
    public ProcedureOrder createOrder(Long patientId, Long encounterId, String procedureName, String snomedCode, String username) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + patientId + " not found"));

        User orderingProvider = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User " + username + " not found"));

        Encounter encounter = encounterId != null ? encounterRepository.findById(encounterId).orElse(null) : null;

        ProcedureOrder order = new ProcedureOrder(patient, encounter, orderingProvider, procedureName, snomedCode);
        ProcedureOrder saved = procedureOrderRepository.save(order);

        auditTrailService.logAction(username, "CREATE_PROCEDURE_ORDER", "PROCEDURE_ORDER", saved.getId().toString(), "Placed procedure order: " + procedureName);
        return saved;
    }

    /**
     * Procedure Order Lifecycle State Transitions:
     * ORDERED -> SCHEDULED -> PRE_PROCEDURE -> PERFORMED -> POST_PROCEDURE -> DOCUMENTED
     */
    @Transactional
    public ProcedureOrder updateStatus(Long orderId, String newStatus, String operativeReport, String username) {
        ProcedureOrder order = procedureOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure order with ID " + orderId + " not found"));

        order.setStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();

        if ("SCHEDULED".equalsIgnoreCase(newStatus)) {
            order.setScheduledAt(now);
        } else if ("PERFORMED".equalsIgnoreCase(newStatus)) {
            order.setPerformedAt(now);
        } else if ("DOCUMENTED".equalsIgnoreCase(newStatus)) {
            order.setDocumentedAt(now);
            if (operativeReport != null) order.setOperativeReport(operativeReport);
            User proceduralist = userRepository.findByUsername(username).orElse(null);
            order.setProceduralist(proceduralist);
        }

        ProcedureOrder saved = procedureOrderRepository.save(order);
        auditTrailService.logAction(username, "UPDATE_PROCEDURE_STATUS", "PROCEDURE_ORDER", orderId.toString(), "Updated procedure order status to " + newStatus);
        return saved;
    }
}
