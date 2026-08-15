package com.sentinel.encounters.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.entity.ImagingOrder;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.encounters.repository.ImagingOrderRepository;
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
public class ImagingOrderService {

    private final ImagingOrderRepository imagingOrderRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditTrailService;

    public ImagingOrderService(ImagingOrderRepository imagingOrderRepository,
                               PatientRepository patientRepository,
                               EncounterRepository encounterRepository,
                               UserRepository userRepository,
                               AuditTrailService auditTrailService) {
        this.imagingOrderRepository = imagingOrderRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.userRepository = userRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional(readOnly = true)
    public List<ImagingOrder> getOrdersByPatient(Long patientId) {
        return imagingOrderRepository.findByPatientIdOrderByOrderedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<ImagingOrder> getOrdersByEncounter(Long encounterId) {
        return imagingOrderRepository.findByEncounterIdOrderByOrderedAtDesc(encounterId);
    }

    @Transactional(readOnly = true)
    public List<ImagingOrder> getAllOrders() {
        return imagingOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<ImagingOrder> getOrderById(Long id) {
        return imagingOrderRepository.findById(id);
    }

    @Transactional
    public ImagingOrder createOrder(Long patientId, Long encounterId, String modality, String procedureName, String cptCode, String username) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + patientId + " not found"));

        User orderingProvider = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User " + username + " not found"));

        Encounter encounter = encounterId != null ? encounterRepository.findById(encounterId).orElse(null) : null;

        ImagingOrder order = new ImagingOrder(patient, encounter, orderingProvider, modality, procedureName, cptCode);
        ImagingOrder saved = imagingOrderRepository.save(order);

        auditTrailService.logAction(username, "CREATE_IMAGING_ORDER", "IMAGING_ORDER", saved.getId().toString(), "Placed diagnostic imaging order: " + procedureName + " (" + modality + ")");
        return saved;
    }

    @Transactional
    public ImagingOrder updateStatus(Long orderId, String newStatus, String report, String dicomUid, String username) {
        ImagingOrder order = imagingOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging order with ID " + orderId + " not found"));

        order.setStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();

        if ("SCHEDULED".equalsIgnoreCase(newStatus)) {
            order.setScheduledAt(now);
        } else if ("PERFORMED".equalsIgnoreCase(newStatus)) {
            order.setPerformedAt(now);
            if (dicomUid != null) order.setDicomStudyInstanceUid(dicomUid);
        } else if ("REPORT_GENERATED".equalsIgnoreCase(newStatus)) {
            order.setReportGeneratedAt(now);
            if (report != null) order.setRadiologistReport(report);
            User radiologist = userRepository.findByUsername(username).orElse(null);
            order.setRadiologist(radiologist);
        } else if ("CLINICIAN_REVIEWED".equalsIgnoreCase(newStatus)) {
            order.setReviewedAt(now);
        }

        ImagingOrder saved = imagingOrderRepository.save(order);
        auditTrailService.logAction(username, "UPDATE_IMAGING_STATUS", "IMAGING_ORDER", orderId.toString(), "Updated imaging order status to " + newStatus);
        return saved;
    }
}
