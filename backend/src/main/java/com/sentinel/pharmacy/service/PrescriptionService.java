package com.sentinel.pharmacy.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.pharmacy.dto.CreatePrescriptionRequest;
import com.sentinel.pharmacy.dto.PrescriptionResponseDTO;
import com.sentinel.pharmacy.dto.UpdatePrescriptionRequest;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               EncounterRepository encounterRepository,
                               PatientRepository patientRepository,
                               AuditService auditService) {
        this.prescriptionRepository = prescriptionRepository;
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    public PrescriptionResponseDTO createPrescription(UUID encounterId, CreatePrescriptionRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        Prescription rx = new Prescription();
        rx.setEncounter(encounter);
        rx.setPatient(encounter.getPatient());
        rx.setOrganization(encounter.getOrganization());
        rx.setMedicationName(request.getMedicationName());
        rx.setRxNormCode(request.getRxNormCode());
        rx.setDosage(request.getDosage());
        rx.setRoute(request.getRoute());
        rx.setFrequency(request.getFrequency());
        rx.setDurationDays(request.getDurationDays());
        rx.setIndication(request.getIndication());
        rx.setInstructions(request.getInstructions());
        rx.setRefills(request.getRefills() != null ? request.getRefills() : 0);
        rx.setStatus("ACTIVE");
        rx.setPrescribedAt(OffsetDateTime.now());
        rx.setStartAt(request.getStartAt() != null ? request.getStartAt() : OffsetDateTime.now());
        rx.setEndAt(request.getEndAt());
        rx.setCreatedAt(OffsetDateTime.now());
        rx.setUpdatedAt(OffsetDateTime.now());

        Prescription saved = prescriptionRepository.save(rx);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRESCRIPTION_CREATED", "Prescribed " + saved.getMedicationName() + " on encounter " + encounter.getEncounterNumber());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDTO> getEncounterPrescriptions(UUID encounterId) {
        return prescriptionRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDTO> getPatientPrescriptions(UUID patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponseDTO getPrescription(UUID prescriptionId) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));
        return mapToDTO(rx);
    }

    public PrescriptionResponseDTO updatePrescription(UUID prescriptionId, UpdatePrescriptionRequest request) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));

        if (request.getStatus() != null) rx.setStatus(request.getStatus());
        if (request.getIndication() != null) rx.setIndication(request.getIndication());
        if (request.getInstructions() != null) rx.setInstructions(request.getInstructions());
        if (request.getRefills() != null) rx.setRefills(request.getRefills());
        if (request.getEndAt() != null) rx.setEndAt(request.getEndAt());
        rx.setUpdatedAt(OffsetDateTime.now());

        Prescription saved = prescriptionRepository.save(rx);
        return mapToDTO(saved);
    }

    public PrescriptionResponseDTO discontinuePrescription(UUID prescriptionId) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));

        rx.setStatus("DISCONTINUED");
        rx.setEndAt(OffsetDateTime.now());
        rx.setUpdatedAt(OffsetDateTime.now());
        Prescription saved = prescriptionRepository.save(rx);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRESCRIPTION_DISCONTINUED", "Discontinued prescription for " + saved.getMedicationName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDTO> getAllPrescriptions(String status, String search) {
        UUID organizationId = com.sentinel.security.TenantContext.getCurrentOrganizationId();
        List<Prescription> list;
        if (organizationId != null) {
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                list = prescriptionRepository.findByOrganizationIdAndStatusOrderByPrescribedAtDesc(organizationId, status.toUpperCase());
            } else {
                list = prescriptionRepository.findByOrganizationIdOrderByPrescribedAtDesc(organizationId);
            }
        } else {
            list = prescriptionRepository.findAllByOrderByPrescribedAtDesc();
        }

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            list = list.stream().filter(p -> {
                boolean medMatch = p.getMedicationName() != null && p.getMedicationName().toLowerCase().contains(q);
                boolean ptMatch = p.getPatient() != null && p.getPatient().getFullName() != null && p.getPatient().getFullName().toLowerCase().contains(q);
                boolean mrnMatch = p.getPatient() != null && p.getPatient().getPatientCode() != null && p.getPatient().getPatientCode().toLowerCase().contains(q);
                return medMatch || ptMatch || mrnMatch;
            }).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public PrescriptionResponseDTO verifyPrescription(UUID prescriptionId, String notes) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));
        if ("DISPENSED".equalsIgnoreCase(rx.getStatus())) {
            throw new IllegalStateException("Prescription has already been dispensed and cannot be re-verified.");
        }
        rx.setStatus("PHARMACY_VERIFIED");
        if (notes != null && !notes.isBlank()) {
            String existing = rx.getInstructions() != null ? rx.getInstructions() + " | Verification notes: " + notes : "Verification notes: " + notes;
            rx.setInstructions(existing);
        }
        rx.setUpdatedAt(OffsetDateTime.now());
        Prescription saved = prescriptionRepository.save(rx);
        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRESCRIPTION_VERIFIED", "Pharmacist verified prescription for " + saved.getMedicationName());
        }
        return mapToDTO(saved);
    }

    public PrescriptionResponseDTO rejectPrescription(UUID prescriptionId, String reason) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));
        rx.setStatus("REJECTED");
        if (reason != null && !reason.isBlank()) {
            rx.setIndication(rx.getIndication() != null ? rx.getIndication() + " | Rejection reason: " + reason : "Rejection reason: " + reason);
        }
        rx.setUpdatedAt(OffsetDateTime.now());
        Prescription saved = prescriptionRepository.save(rx);
        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRESCRIPTION_REJECTED", "Pharmacist rejected prescription for " + saved.getMedicationName() + ": " + reason);
        }
        return mapToDTO(saved);
    }

    public PrescriptionResponseDTO dispensePrescription(UUID prescriptionId, String notes) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));
        rx.setStatus("DISPENSED");
        rx.setUpdatedAt(OffsetDateTime.now());
        Prescription saved = prescriptionRepository.save(rx);
        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRESCRIPTION_DISPENSED", "Pharmacist dispensed prescription for " + saved.getMedicationName());
        }
        return mapToDTO(saved);
    }

    public PrescriptionResponseDTO mapToDTO(Prescription p) {
        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setId(p.getId());
        if (p.getPatient() != null) dto.setPatientId(p.getPatient().getId());
        if (p.getEncounter() != null) dto.setEncounterId(p.getEncounter().getId());
        dto.setMedicationName(p.getMedicationName());
        dto.setRxNormCode(p.getRxNormCode());
        dto.setDosage(p.getDosage());
        dto.setRoute(p.getRoute());
        dto.setFrequency(p.getFrequency());
        dto.setDurationDays(p.getDurationDays());
        dto.setStatus(p.getStatus());
        dto.setIndication(p.getIndication());
        dto.setInstructions(p.getInstructions());
        dto.setRefills(p.getRefills());
        if (p.getDoctor() != null) {
            dto.setDoctorId(p.getDoctor().getId());
            dto.setDoctorName(p.getDoctor().getFullName());
        }
        dto.setPrescribedAt(p.getPrescribedAt());
        dto.setStartAt(p.getStartAt());
        dto.setEndAt(p.getEndAt());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
