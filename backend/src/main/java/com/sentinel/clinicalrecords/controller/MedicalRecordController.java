package com.sentinel.clinicalrecords.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinicalrecords.dto.MedicalRecordRequestDTO;
import com.sentinel.clinicalrecords.dto.MedicalRecordResponseDTO;
import com.sentinel.clinicalrecords.entity.MedicalRecord;
import com.sentinel.clinicalrecords.mapper.MedicalRecordMapper;
import com.sentinel.clinicalrecords.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    private final MedicalRecordMapper recordMapper;

    public MedicalRecordController(MedicalRecordService medicalRecordService,
                                   AuditTrailService auditService,
                                   MedicalRecordMapper recordMapper) {
        this.medicalRecordService = medicalRecordService;
        this.auditService = auditService;
        this.recordMapper = recordMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<MedicalRecordResponseDTO> getRecordsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "MEDICAL_RECORD", String.valueOf(patientId), "Fetched medical history for patient ID: " + patientId);
        return medicalRecordService.getRecordsByPatientId(patientId).stream()
                .map(recordMapper::toResponseDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<MedicalRecordResponseDTO> createRecord(@Valid @RequestBody MedicalRecordRequestDTO payload, Authentication auth) {
        MedicalRecord entity = recordMapper.toEntity(payload);
        // Link patient ID in entity structure expected by createRecord
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        MedicalRecord saved = medicalRecordService.createRecord(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "MEDICAL_RECORD", String.valueOf(saved.getId()), "Created clinical encounter note for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(recordMapper.toResponseDTO(saved));
    }
}
