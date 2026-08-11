package com.sentinel.allergies.controller;

import com.sentinel.allergies.dto.AllergyRequestDTO;
import com.sentinel.allergies.dto.AllergyResponseDTO;
import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.mapper.AllergyMapper;
import com.sentinel.allergies.service.AllergyService;
import com.sentinel.audit.service.AuditTrailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    private final AllergyMapper allergyMapper;

    public AllergyController(AllergyService allergyService,
                             AuditTrailService auditService,
                             AllergyMapper allergyMapper) {
        this.allergyService = allergyService;
        this.auditService = auditService;
        this.allergyMapper = allergyMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("(hasAuthority('ALLERGY_READ') or hasAuthority('DIAGNOSIS_READ') or hasAuthority('VITALS_READ') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE') or hasRole('ROLE_PATIENT')) and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<AllergyResponseDTO> getAllergiesByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "ALLERGY", String.valueOf(patientId), "Accessed allergy profile for patient ID: " + patientId);
        return allergyService.getAllergiesByPatientId(patientId).stream()
                .map(allergyMapper::toResponseDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("(hasAuthority('ALLERGY_CREATE') or hasAuthority('VITALS_CREATE') or hasAuthority('CLINICAL_NOTE_CREATE') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE')) and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<AllergyResponseDTO> createAllergy(@Valid @RequestBody AllergyRequestDTO payload, Authentication auth) {
        Allergy entity = allergyMapper.toEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        Allergy saved = allergyService.createAllergy(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "ALLERGY", String.valueOf(saved.getId()), "Recorded " + saved.getSeverity() + " allergy to " + saved.getAllergenName() + " for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(allergyMapper.toResponseDTO(saved));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("(hasAuthority('ALLERGY_CREATE') or hasAuthority('VITALS_CREATE') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_NURSE')) and @patientSecurityService.canAccessAllergy(authentication, #id)")
    public ResponseEntity<AllergyResponseDTO> updateAllergyStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Allergy saved = allergyService.updateAllergyStatus(id, status);
        auditService.logAction(auth, "UPDATE", "ALLERGY", String.valueOf(id), "Updated allergy status to " + status + " for allergy ID: " + id);
        return ResponseEntity.ok(allergyMapper.toResponseDTO(saved));
    }
}
