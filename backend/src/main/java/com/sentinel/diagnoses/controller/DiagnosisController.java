package com.sentinel.diagnoses.controller;

import com.sentinel.diagnoses.dto.DiagnosisStatusUpdateDTO;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.diagnoses.dto.DiagnosisRequestDTO;
import com.sentinel.diagnoses.dto.DiagnosisResponseDTO;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.mapper.DiagnosisMapper;
import com.sentinel.diagnoses.service.DiagnosisService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diagnoses")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final AuditTrailService auditService;
    private final DiagnosisMapper diagnosisMapper;

    public DiagnosisController(DiagnosisService diagnosisService,
                                AuditTrailService auditService,
                                DiagnosisMapper diagnosisMapper) {
        this.diagnosisService = diagnosisService;
        this.auditService = auditService;
        this.diagnosisMapper = diagnosisMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("(hasAuthority('DIAGNOSIS_READ') or hasAuthority('ROLE_DOCTOR') or hasAuthority('ROLE_NURSE') or hasAuthority('ROLE_PATIENT')) and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<DiagnosisResponseDTO> getDiagnosesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "DIAGNOSIS", String.valueOf(patientId), "Accessed active problem list for patient ID: " + patientId);
        return diagnosisService.getDiagnosesByPatientId(patientId).stream()
                .map(diagnosisMapper::toResponseDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("(hasAuthority('DIAGNOSIS_CREATE') or hasAuthority('ROLE_DOCTOR') or hasAuthority('ROLE_NURSE')) and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<DiagnosisResponseDTO> createDiagnosis(@Valid @RequestBody DiagnosisRequestDTO payload, Authentication auth) {
        Diagnosis entity = diagnosisMapper.toEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        Diagnosis saved = diagnosisService.createDiagnosis(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "DIAGNOSIS", String.valueOf(saved.getId()), "Recorded diagnosis: " + saved.getDiagnosisName() + " (ICD: " + saved.getIcd10Code() + ") for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(diagnosisMapper.toResponseDTO(saved));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("(hasAuthority('DIAGNOSIS_UPDATE') or hasAuthority('ROLE_DOCTOR') or hasAuthority('ROLE_NURSE')) and @patientSecurityService.canAccessDiagnosis(authentication, #id)")
    public ResponseEntity<DiagnosisResponseDTO> updateDiagnosisStatus(
            @PathVariable Long id,
            @Valid @RequestBody DiagnosisStatusUpdateDTO payload,
            Authentication auth) {
        Diagnosis saved = diagnosisService.updateDiagnosisStatus(id, payload.getStatus());
        auditService.logAction(auth, "UPDATE", "DIAGNOSIS", String.valueOf(id), "Updated diagnosis lifecycle status to " + payload.getStatus() + " for ID: " + id);
        return ResponseEntity.ok(diagnosisMapper.toResponseDTO(saved));
    }
}
