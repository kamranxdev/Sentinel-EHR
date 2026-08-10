package com.sentinel.prescriptions.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.patients.service.PatientSecurityService;
import com.sentinel.prescriptions.dto.PrescriptionSafetyCheckRequest;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.service.PrescriptionService;
import com.sentinel.prescriptions.service.SmartSafetyService.SafetyCheckResult;
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

    public PrescriptionController(PrescriptionService prescriptionService,
                                   AuditTrailService auditService,
                                   PatientSecurityService patientSecurityService) {
        this.prescriptionService = prescriptionService;
        this.auditService = auditService;
        this.patientSecurityService = patientSecurityService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('PRESCRIPTION_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Prescription> getPrescriptionsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "PRESCRIPTION", String.valueOf(patientId), "Accessed eRx prescription history for patient ID: " + patientId);
        return prescriptionService.getPrescriptionsByPatientId(patientId);
    }

    @PostMapping("/safety-check")
    @PreAuthorize("hasAuthority('PRESCRIPTION_CREATE')")
    public ResponseEntity<SafetyCheckResult> checkSafety(@RequestBody PrescriptionSafetyCheckRequest request, Authentication auth) {
        if (request.getPatientId() == null || request.getMedicationName() == null) {
            throw new IllegalArgumentException("patientId and medicationName are required fields");
        }

        if (!patientSecurityService.canAccessPatient(auth, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String primaryRole = getPrimaryRole(auth);
        SafetyCheckResult result = prescriptionService.validateSafety(
                request.getPatientId(), 
                request.getMedicationName(), 
                auth.getName(), 
                primaryRole
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/validate-safety")
    @PreAuthorize("hasAuthority('PRESCRIPTION_READ')")
    public ResponseEntity<SafetyCheckResult> validatePrescriptionSafety(@RequestBody PrescriptionSafetyCheckRequest request, Authentication auth) {
        if (request.getPatientId() == null || request.getMedicationName() == null) {
            throw new IllegalArgumentException("patientId and medicationName are required for safety validation");
        }

        if (!patientSecurityService.canAccessPatient(auth, request.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String primaryRole = getPrimaryRole(auth);
        SafetyCheckResult result = prescriptionService.validateSafety(
                request.getPatientId(),
                request.getMedicationName(),
                auth.getName(),
                primaryRole
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRESCRIPTION_CREATE') and (#prescription != null and #prescription.patient != null and #prescription.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #prescription.patient.id))")
    public ResponseEntity<?> createPrescription(@RequestBody Prescription prescription, 
                                                 @RequestParam(value = "overrideWarning", defaultValue = "false") boolean overrideWarning,
                                                 Authentication auth) {
        if (prescription.getPatient() == null || prescription.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required for prescription creation");
        }

        String primaryRole = getPrimaryRole(auth);
        SafetyCheckResult safetyResult = prescriptionService.validateSafety(
                prescription.getPatient().getId(), 
                prescription.getMedicationName(), 
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

        Prescription saved = prescriptionService.createPrescription(prescription, auth.getName());
        
        String auditDetail = "Prescribed " + saved.getMedicationName() + " (" + saved.getDosage() + ") to patient ID: " + saved.getPatient().getId();
        if (!safetyResult.isSafe() && overrideWarning) {
            auditDetail += " [CLINICIAN OVERRIDE OF ALLERGY WARNING: " + safetyResult.getConflictingAllergen() + "]";
        }

        auditService.logAction(auth, "CREATE", "PRESCRIPTION", String.valueOf(saved.getId()), auditDetail);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PRESCRIPTION_READ') and @patientSecurityService.canAccessPrescription(authentication, #id)")
    public ResponseEntity<Prescription> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Prescription saved = prescriptionService.updateStatus(id, status);
        auditService.logAction(auth, "UPDATE", "PRESCRIPTION", String.valueOf(id), "Updated prescription ID: " + id + " status to " + status);

        return ResponseEntity.ok(saved);
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
