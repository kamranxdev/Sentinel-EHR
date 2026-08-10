package com.sentinel.vitals.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.authorization.evaluator.ABACEvaluator;
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
@RequestMapping({"/api/v1/vitals", "/api/vitals"})
public class VitalsController {

    private final VitalSignService vitalSignService;
    private final AuditTrailService auditService;
    private final ABACEvaluator abacEvaluator;
    private final VitalsMapper vitalsMapper;

    public VitalsController(VitalSignService vitalSignService,
                            AuditTrailService auditService,
                            ABACEvaluator abacEvaluator,
                            VitalsMapper vitalsMapper) {
        this.vitalSignService = vitalSignService;
        this.auditService = auditService;
        this.abacEvaluator = abacEvaluator;
        this.vitalsMapper = vitalsMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('VITALS_READ')")
    public List<VitalsResponseDTO> getVitalsByPatient(@PathVariable Long patientId, Authentication auth) {
        if (!abacEvaluator.canAccessPatientData(auth, patientId, "READ_VITALS")) {
            throw new org.springframework.security.access.AccessDeniedException("ABAC Policy Violation: Department mismatch or no active care relationship.");
        }

        auditService.logAction(auth, "READ", "VITALS", String.valueOf(patientId), "Accessed physiological vitals for patient ID: " + patientId);
        return vitalSignService.getVitalsEntityByPatientId(patientId).stream()
                .map(vitalsMapper::toResponseDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VITALS_CREATE') and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
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

    @PostMapping("/telemetry")
    @PreAuthorize("hasAuthority('VITALS_CREATE') and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<VitalsResponseDTO> recordTelemetry(@Valid @RequestBody VitalsRequestDTO payload, Authentication auth) {
        Vitals entity = vitalsMapper.toEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        Vitals saved = vitalSignService.recordTelemetry(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "TELEMETRY_VITALS", String.valueOf(saved.getId()), 
                "Recorded telemetry flowsheet (BP: " + saved.getBloodPressure() + ", HR: " + saved.getHeartRate() 
                + ", SpO2: " + saved.getOxygenSaturation() + "%, Pain Score: " + (saved.getPainScore() != null ? saved.getPainScore() : "N/A") 
                + ", Intake: " + (saved.getFluidIntakeMl() != null ? saved.getFluidIntakeMl() + "mL" : "N/A") 
                + ", Output: " + (saved.getFluidOutputMl() != null ? saved.getFluidOutputMl() + "mL" : "N/A") 
                + ") for patient ID: " + saved.getPatient().getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(vitalsMapper.toResponseDTO(saved));
    }
}
