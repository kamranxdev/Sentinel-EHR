package com.sentinel.nursing.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.nursing.dto.EmarRecordRequestDTO;
import com.sentinel.nursing.dto.EmarRecordResponseDTO;
import com.sentinel.nursing.dto.TriageEwsRequestDTO;
import com.sentinel.nursing.dto.TriageEwsResponseDTO;
import com.sentinel.nursing.entity.EmarRecord;
import com.sentinel.nursing.entity.TriageEwsRecord;
import com.sentinel.nursing.mapper.NursingMapper;
import com.sentinel.nursing.service.NursingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nursing")
public class NursingController {

    private final NursingService nursingService;
    private final AuditTrailService auditService;
    private final NursingMapper nursingMapper;

    public NursingController(NursingService nursingService,
                             AuditTrailService auditService,
                             NursingMapper nursingMapper) {
        this.nursingService = nursingService;
        this.auditService = auditService;
        this.nursingMapper = nursingMapper;
    }

    // --- 1. CLINICAL TRIAGE ---
    @PostMapping("/triage")
    @PreAuthorize("hasAnyAuthority('VITALS_CREATE', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<TriageEwsResponseDTO> submitTriage(@Valid @RequestBody TriageEwsRequestDTO payload, Authentication auth) {
        TriageEwsRecord entity = nursingMapper.toTriageEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        TriageEwsRecord saved = nursingService.submitTriage(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "CLINICAL_TRIAGE", String.valueOf(saved.getId()),
                "Recorded triage intake (" + saved.getTriagePriority() + ") for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(nursingMapper.toTriageResponseDTO(saved));
    }

    @GetMapping("/triage/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('VITALS_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN')")
    public List<TriageEwsResponseDTO> getTriageRecordsForPatient(@PathVariable Long patientId, Authentication auth) {
        return nursingService.getTriageRecordsForPatient(patientId).stream()
                .map(nursingMapper::toTriageResponseDTO)
                .toList();
    }

    // --- 2. eMAR MEDICATION ADMINISTRATION ---
    @PostMapping("/emar/administer")
    @PreAuthorize("hasAnyAuthority('MAR_ADMINISTER', 'ROLE_NURSE', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<EmarRecordResponseDTO> recordEmarAdministration(@Valid @RequestBody EmarRecordRequestDTO payload, Authentication auth) {
        EmarRecord entity = nursingMapper.toEmarEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        if (payload.getPrescriptionId() != null) {
            com.sentinel.prescriptions.entity.Prescription rx = new com.sentinel.prescriptions.entity.Prescription();
            rx.setId(payload.getPrescriptionId());
            entity.setPrescription(rx);
        }

        EmarRecord saved = nursingService.recordEmarAdministration(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "EMAR_ADMINISTER", String.valueOf(saved.getId()),
                "Logged eMAR administration of " + saved.getMedicationName() + " (" + saved.getDose() + ") for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(nursingMapper.toEmarResponseDTO(saved));
    }

    @GetMapping("/emar/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('MAR_READ', 'PRESCRIPTION_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_PHARMACIST', 'ROLE_SYS_ADMIN')")
    public List<EmarRecordResponseDTO> getEmarHistoryForPatient(@PathVariable Long patientId, Authentication auth) {
        return nursingService.getEmarHistoryForPatient(patientId).stream()
                .map(nursingMapper::toEmarResponseDTO)
                .toList();
    }
}
