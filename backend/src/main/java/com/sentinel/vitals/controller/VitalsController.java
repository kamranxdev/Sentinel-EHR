package com.sentinel.vitals.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.vitals.dto.VitalsRequestDTO;
import com.sentinel.vitals.dto.VitalsResponseDTO;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.mapper.VitalsMapper;
import com.sentinel.vitals.service.VitalSignService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("vitalSignController")
@RequestMapping("/api/v1/vitals")
public class VitalsController {

    private final VitalSignService vitalSignService;
    private final AuditTrailService auditService;
    private final VitalsMapper vitalsMapper;

    public VitalsController(VitalSignService vitalSignService,
                            AuditTrailService auditService,
                            VitalsMapper vitalsMapper) {
        this.vitalSignService = vitalSignService;
        this.auditService = auditService;
        this.vitalsMapper = vitalsMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("(hasAuthority('VITALS_READ') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE') or hasRole('ROLE_PATIENT')) and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<VitalsResponseDTO> getVitalsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "VITALS", String.valueOf(patientId), "Accessed physiological vitals for patient ID: " + patientId);
        return vitalSignService.getVitalsEntityByPatientId(patientId).stream()
                .map(vitalsMapper::toResponseDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("(hasAuthority('VITALS_CREATE') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE')) and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<VitalsResponseDTO> recordVitals(@Valid @RequestBody VitalsRequestDTO payload, Authentication auth) {
        Vitals entity = vitalsMapper.toEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        Vitals saved = vitalSignService.recordVitals(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "VITALS", String.valueOf(saved.getId()), 
                "Recorded vital signs (BP: " + saved.getBloodPressure() + ", Pulse: " + saved.getHeartRate() 
                + " bpm, Glucose: " + (saved.getBloodGlucose() != null ? saved.getBloodGlucose() + " mg/dL" : "N/A") 
                + ", BMI: " + (saved.getBmi() != null ? saved.getBmi() : "N/A") + ") for patient ID: " + saved.getPatient().getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(vitalsMapper.toResponseDTO(saved));
    }
}
