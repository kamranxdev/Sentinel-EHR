package com.sentinel.nursing.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.nursing.entity.EmarRecord;
import com.sentinel.nursing.entity.TriageEwsRecord;
import com.sentinel.nursing.service.NursingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/nursing", "/api/nursing"})
public class NursingController {

    private final NursingService nursingService;
    private final AuditTrailService auditService;

    public NursingController(NursingService nursingService,
                             AuditTrailService auditService) {
        this.nursingService = nursingService;
        this.auditService = auditService;
    }

    // --- 1. CLINICAL TRIAGE ---
    @PostMapping({"/triage", "/triage-ews"})
    @PreAuthorize("hasAnyAuthority('VITALS_CREATE', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<?> submitTriage(@RequestBody TriageEwsRecord record, Authentication auth) {
        TriageEwsRecord saved = nursingService.submitTriage(record, auth.getName());
        auditService.logAction(auth, "CREATE", "CLINICAL_TRIAGE", String.valueOf(saved.getId()),
                "Recorded triage intake (" + saved.getTriagePriority() + ") for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping({"/triage/patient/{patientId}", "/triage-ews/patient/{patientId}"})
    @PreAuthorize("hasAnyAuthority('VITALS_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN')")
    public List<TriageEwsRecord> getTriageRecordsForPatient(@PathVariable Long patientId, Authentication auth) {
        return nursingService.getTriageRecordsForPatient(patientId);
    }

    // --- 2. eMAR MEDICATION ADMINISTRATION ---
    @PostMapping("/emar/administer")
    @PreAuthorize("hasAnyAuthority('MAR_ADMINISTER', 'ROLE_NURSE', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<?> recordEmarAdministration(@RequestBody EmarRecord emar, Authentication auth) {
        EmarRecord saved = nursingService.recordEmarAdministration(emar, auth.getName());
        auditService.logAction(auth, "CREATE", "EMAR_ADMINISTER", String.valueOf(saved.getId()),
                "Logged eMAR administration of " + saved.getMedicationName() + " (" + saved.getDose() + ") for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/emar/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('MAR_READ', 'PRESCRIPTION_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_PHARMACIST', 'ROLE_SYS_ADMIN')")
    public List<EmarRecord> getEmarHistoryForPatient(@PathVariable Long patientId, Authentication auth) {
        return nursingService.getEmarHistoryForPatient(patientId);
    }
}

