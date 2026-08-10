package com.sentinel.vitals.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.authorization.evaluator.ABACEvaluator;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.service.VitalSignService;
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

    public VitalsController(VitalSignService vitalSignService,
                            AuditTrailService auditService,
                            ABACEvaluator abacEvaluator) {
        this.vitalSignService = vitalSignService;
        this.auditService = auditService;
        this.abacEvaluator = abacEvaluator;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('VITALS_READ')")
    public List<Vitals> getVitalsByPatient(@PathVariable Long patientId, Authentication auth) {
        if (!abacEvaluator.canAccessPatientData(auth, patientId, "READ_VITALS")) {
            throw new org.springframework.security.access.AccessDeniedException("ABAC Policy Violation: Department mismatch or no active care relationship.");
        }

        auditService.logAction(auth, "READ", "VITALS", String.valueOf(patientId), "Accessed physiological vitals for patient ID: " + patientId);
        return vitalSignService.getVitalsEntityByPatientId(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VITALS_CREATE') and (#vitals != null and #vitals.patient != null and #vitals.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #vitals.patient.id))")
    public ResponseEntity<?> recordVitals(@RequestBody Vitals vitals, Authentication auth) {
        Vitals saved = vitalSignService.recordVitals(vitals, auth.getName());
        auditService.logAction(auth, "CREATE", "VITALS", String.valueOf(saved.getId()), 
                "Recorded vital signs (BP: " + saved.getBloodPressure() + ", Pulse: " + saved.getHeartRate() 
                + " bpm, Glucose: " + (saved.getBloodGlucose() != null ? saved.getBloodGlucose() + " mg/dL" : "N/A") 
                + ", BMI: " + (saved.getBmi() != null ? saved.getBmi() : "N/A") + ") for patient ID: " + saved.getPatient().getId());

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/telemetry")
    @PreAuthorize("hasAuthority('VITALS_CREATE') and (#vitals != null and #vitals.patient != null and #vitals.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #vitals.patient.id))")
    public ResponseEntity<?> recordTelemetry(@RequestBody Vitals vitals, Authentication auth) {
        Vitals saved = vitalSignService.recordTelemetry(vitals, auth.getName());
        auditService.logAction(auth, "CREATE", "TELEMETRY_VITALS", String.valueOf(saved.getId()), 
                "Recorded telemetry flowsheet (BP: " + saved.getBloodPressure() + ", HR: " + saved.getHeartRate() 
                + ", SpO2: " + saved.getOxygenSaturation() + "%, Pain Score: " + (saved.getPainScore() != null ? saved.getPainScore() : "N/A") 
                + ", Intake: " + (saved.getFluidIntakeMl() != null ? saved.getFluidIntakeMl() + "mL" : "N/A") 
                + ", Output: " + (saved.getFluidOutputMl() != null ? saved.getFluidOutputMl() + "mL" : "N/A") 
                + ") for patient ID: " + saved.getPatient().getId());

        return ResponseEntity.ok(saved);
    }
}

