package com.sentinel.allergies.controller;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.service.AllergyService;
import com.sentinel.audit.service.AuditTrailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/allergies", "/api/allergies"})
public class AllergyController {

    private final AllergyService allergyService;
    private final AuditTrailService auditService;

    public AllergyController(AllergyService allergyService,
                             AuditTrailService auditService) {
        this.allergyService = allergyService;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("(hasAuthority('ALLERGY_READ') or hasAuthority('DIAGNOSIS_READ') or hasAuthority('VITALS_READ')) and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Allergy> getAllergiesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "ALLERGY", String.valueOf(patientId), "Accessed allergy profile for patient ID: " + patientId);
        return allergyService.getAllergiesByPatientId(patientId);
    }

    @PostMapping
    @PreAuthorize("(hasAuthority('ALLERGY_CREATE') or hasAuthority('VITALS_CREATE') or hasAuthority('CLINICAL_NOTE_CREATE')) and (#allergy != null and #allergy.patient != null and #allergy.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #allergy.patient.id))")
    public ResponseEntity<?> createAllergy(@RequestBody Allergy allergy, Authentication auth) {
        Allergy saved = allergyService.createAllergy(allergy, auth.getName());
        auditService.logAction(auth, "CREATE", "ALLERGY", String.valueOf(saved.getId()), "Recorded " + saved.getSeverity() + " allergy to " + saved.getAllergenName() + " for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("(hasAuthority('ALLERGY_CREATE') or hasAuthority('VITALS_CREATE')) and @patientSecurityService.canAccessAllergy(authentication, #id)")
    public ResponseEntity<?> updateAllergyStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Allergy saved = allergyService.updateAllergyStatus(id, status);
        auditService.logAction(auth, "UPDATE", "ALLERGY", String.valueOf(id), "Updated allergy status to " + status + " for allergy ID: " + id);
        return ResponseEntity.ok(saved);
    }
}

