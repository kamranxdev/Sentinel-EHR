package com.sentinel.clinicalrecords.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinicalrecords.entity.MedicalRecord;
import com.sentinel.clinicalrecords.service.MedicalRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/clinical-records", "/api/records"})
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final AuditTrailService auditService;

    public MedicalRecordController(MedicalRecordService medicalRecordService,
                                   AuditTrailService auditService) {
        this.medicalRecordService = medicalRecordService;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<MedicalRecord> getRecordsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "MEDICAL_RECORD", String.valueOf(patientId), "Fetched medical history for patient ID: " + patientId);
        return medicalRecordService.getRecordsByPatientId(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and (#record != null and #record.patient != null and #record.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #record.patient.id))")
    public ResponseEntity<?> createRecord(@RequestBody MedicalRecord record, Authentication auth) {
        MedicalRecord saved = medicalRecordService.createRecord(record, auth.getName());
        auditService.logAction(auth, "CREATE", "MEDICAL_RECORD", String.valueOf(saved.getId()), "Created clinical encounter note for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.ok(saved);
    }
}

