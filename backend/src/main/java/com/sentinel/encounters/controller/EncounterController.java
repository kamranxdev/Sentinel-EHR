package com.sentinel.encounters.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.service.EncounterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/encounters", "/api/encounters"})
public class EncounterController {

    private final EncounterService encounterService;
    private final AuditTrailService auditService;

    public EncounterController(EncounterService encounterService,
                               AuditTrailService auditService) {
        this.encounterService = encounterService;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Encounter> getEncountersByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "ENCOUNTER", String.valueOf(patientId), "Accessed encounter & visit log history for patient ID: " + patientId);
        return encounterService.getEncountersByPatientId(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and (#encounter != null and #encounter.patient != null and #encounter.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #encounter.patient.id))")
    public ResponseEntity<?> createEncounter(@RequestBody Encounter encounter, Authentication auth) {
        Encounter saved = encounterService.createEncounter(encounter, auth.getName());
        auditService.logAction(auth, "CREATE", "ENCOUNTER", String.valueOf(saved.getId()), "Logged new " + saved.getEncounterType() + " encounter for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and @patientSecurityService.canAccessEncounter(authentication, #id)")
    public ResponseEntity<?> updateEncounter(@PathVariable Long id, @RequestBody Encounter updated, Authentication auth) {
        Encounter saved = encounterService.updateEncounter(id, updated);
        auditService.logAction(auth, "UPDATE", "ENCOUNTER", String.valueOf(id), "Updated encounter details / clinical notes for ID: " + id);
        return ResponseEntity.ok(saved);
    }
}

