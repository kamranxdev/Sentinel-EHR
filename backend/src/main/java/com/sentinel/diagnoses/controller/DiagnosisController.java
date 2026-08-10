package com.sentinel.diagnoses.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.service.DiagnosisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/diagnoses", "/api/diagnoses"})
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final AuditTrailService auditService;

    public DiagnosisController(DiagnosisService diagnosisService,
                                AuditTrailService auditService) {
        this.diagnosisService = diagnosisService;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Diagnosis> getDiagnosesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "DIAGNOSIS", String.valueOf(patientId), "Accessed coded problem list & diagnoses for patient ID: " + patientId);
        return diagnosisService.getDiagnosesByPatientId(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('DIAGNOSIS_CREATE') and (#diagnosis != null and #diagnosis.patient != null and #diagnosis.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #diagnosis.patient.id))")
    public ResponseEntity<?> createDiagnosis(@RequestBody Diagnosis diagnosis, Authentication auth) {
        Diagnosis saved = diagnosisService.createDiagnosis(diagnosis, auth.getName());
        auditService.logAction(auth, "CREATE", "DIAGNOSIS", String.valueOf(saved.getId()), "Logged ICD-10 diagnosis (" + saved.getConditionName() + " - " + saved.getIcdCode() + ") for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('DIAGNOSIS_CREATE') and @patientSecurityService.canAccessDiagnosis(authentication, #id)")
    public ResponseEntity<?> updateDiagnosisStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Diagnosis saved = diagnosisService.updateDiagnosisStatus(id, status);
        auditService.logAction(auth, "UPDATE", "DIAGNOSIS", String.valueOf(id), "Updated diagnosis lifecycle status to " + status + " for ID: " + id);
        return ResponseEntity.ok(saved);
    }
}

