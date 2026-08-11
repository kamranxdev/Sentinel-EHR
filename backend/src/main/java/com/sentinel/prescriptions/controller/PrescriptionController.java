package com.sentinel.prescriptions.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.patients.service.PatientSecurityService;
import com.sentinel.prescriptions.dto.PrescriptionRequestDTO;
import com.sentinel.prescriptions.dto.PrescriptionResponseDTO;
import com.sentinel.prescriptions.dto.PrescriptionSafetyCheckRequest;
import com.sentinel.prescriptions.dto.SafetyCheckResultDTO;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.mapper.PrescriptionMapper;
import com.sentinel.prescriptions.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/prescriptions", "/api/prescriptions"})
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final AuditTrailService auditService;
    private final PatientSecurityService patientSecurityService;
    private final PrescriptionMapper prescriptionMapper;

    public PrescriptionController(PrescriptionService prescriptionService,
                                   AuditTrailService auditService,
                                   PatientSecurityService patientSecurityService,
                                   PrescriptionMapper prescriptionMapper) {
        this.prescriptionService = prescriptionService;
        this.auditService = auditService;
        this.patientSecurityService = patientSecurityService;
        this.prescriptionMapper = prescriptionMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("(hasAuthority('PRESCRIPTION_READ') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE') or hasRole('ROLE_PATIENT')) and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<PrescriptionResponseDTO> getPrescriptionsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "PRESCRIPTION", String.valueOf(patientId), "Accessed eRx prescription history for patient ID: " + patientId);
        return prescriptionService.getPrescriptionsByPatientId(patientId).stream()
                .map(prescriptionMapper::toResponseDTO)
                .toList();
    }

    @PostMapping("/safety-check")
    @PreAuthorize("hasAuthority('PRESCRIPTION_CREATE')")
    public ResponseEntity<SafetyCheckResultDTO> checkSafety(@Valid @RequestBody PrescriptionSafetyCheckRequest request, Authentication auth) {
        if (request.getPatientId() == null || request.getMedicationName() == null) {
            throw new IllegalArgumentException("patientId and medicationName are required fields");
        }

        if (!patientSecurityService.canAccessPatient(auth, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String primaryRole = getPrimaryRole(auth);
        SafetyCheckResultDTO result = prescriptionService.validateSafety(
                request.getPatientId(), 
                request.getMedicationName(), 
                auth.getName(), 
                primaryRole
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/validate-safety")
    @PreAuthorize("hasAuthority('PRESCRIPTION_READ')")
    public ResponseEntity<SafetyCheckResultDTO> validatePrescriptionSafety(@Valid @RequestBody PrescriptionSafetyCheckRequest request, Authentication auth) {
        if (request.getPatientId() == null || request.getMedicationName() == null) {
            throw new IllegalArgumentException("patientId and medicationName are required for safety validation");
        }

        if (!patientSecurityService.canAccessPatient(auth, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String primaryRole = getPrimaryRole(auth);
        SafetyCheckResultDTO result = prescriptionService.validateSafety(
                request.getPatientId(),
                request.getMedicationName(),
                auth.getName(),
                primaryRole
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("(hasAuthority('PRESCRIPTION_CREATE') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE')) and (#payload?.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<?> createPrescription(@Valid @RequestBody PrescriptionRequestDTO payload, 
                                                 @RequestParam(value = "overrideWarning", defaultValue = "false") boolean overrideWarning,
                                                 Authentication auth) {
        if (payload.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID is required for prescription creation");
        }

        String primaryRole = getPrimaryRole(auth);
        SafetyCheckResultDTO safetyResult = prescriptionService.validateSafety(
                payload.getPatientId(), 
                payload.getMedicationName(), 
                auth.getName(), 
                primaryRole
        );

        if (!safetyResult.isSafe() && !overrideWarning) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "CONTRAINDICATION_ALERT",
                    "safetyCheck", safetyResult,
                    "message", safetyResult.getMessage()
            ));
        }

        Prescription entity = prescriptionMapper.toEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        Prescription saved = prescriptionService.createPrescription(entity, auth.getName());
        
        String auditDetail = "Prescribed " + saved.getMedicationName() + " (" + saved.getDosage() + ") to patient ID: " + saved.getPatient().getId();
        if (!safetyResult.isSafe() && overrideWarning) {
            auditDetail += " [CLINICIAN OVERRIDE OF ALLERGY WARNING: " + safetyResult.getConflictingAllergen() + "]";
        }

        auditService.logAction(auth, "CREATE", "PRESCRIPTION", String.valueOf(saved.getId()), auditDetail);

        return ResponseEntity.status(HttpStatus.CREATED).body(prescriptionMapper.toResponseDTO(saved));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PRESCRIPTION_READ') and @patientSecurityService.canAccessPrescription(authentication, #id)")
    public ResponseEntity<PrescriptionResponseDTO> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Prescription saved = prescriptionService.updateStatus(id, status);
        auditService.logAction(auth, "UPDATE", "PRESCRIPTION", String.valueOf(id), "Updated prescription ID: " + id + " status to " + status);

        return ResponseEntity.ok(prescriptionMapper.toResponseDTO(saved));
    }

    private String getPrimaryRole(Authentication auth) {
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .findFirst()
                    .orElse("ROLE_DOCTOR");
        }
        return "ROLE_DOCTOR";
    }
}
