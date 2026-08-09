package com.sentinel.diagnoses.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/diagnoses", "/api/diagnoses"})
public class DiagnosisController {

    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditService;

    public DiagnosisController(DiagnosisRepository diagnosisRepository,
                                PatientRepository patientRepository,
                                UserRepository userRepository,
                                AuditTrailService auditService) {
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('DIAGNOSIS_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Diagnosis> getDiagnosesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "DIAGNOSIS", String.valueOf(patientId), "Accessed coded problem list & diagnoses for patient ID: " + patientId);
        return diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('DIAGNOSIS_CREATE') and (#diagnosis != null and #diagnosis.patient != null and #diagnosis.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #diagnosis.patient.id))")
    public ResponseEntity<?> createDiagnosis(@RequestBody Diagnosis diagnosis, Authentication auth) {
        if (diagnosis.getPatient() == null || diagnosis.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User doctor = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user profile not found"));
        Patient patient = patientRepository.findById(diagnosis.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + diagnosis.getPatient().getId() + " not found"));

        diagnosis.setDoctor(doctor);
        diagnosis.setPatient(patient);

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        auditService.logAction(auth, "CREATE", "DIAGNOSIS", String.valueOf(saved.getId()), "Logged ICD-10 diagnosis (" + saved.getConditionName() + " - " + saved.getIcdCode() + ") for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('DIAGNOSIS_CREATE') and @patientSecurityService.canAccessDiagnosis(authentication, #id)")
    public ResponseEntity<?> updateDiagnosisStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Diagnosis diag = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis record with ID " + id + " not found"));

        diag.setStatus(status);
        Diagnosis saved = diagnosisRepository.save(diag);
        auditService.logAction(auth, "UPDATE", "DIAGNOSIS", String.valueOf(id), "Updated diagnosis lifecycle status to " + status + " for ID: " + id);

        return ResponseEntity.ok(saved);
    }
}
