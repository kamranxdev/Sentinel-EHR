package com.sentinel.encounters.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.encounters.dto.EncounterRequestDTO;
import com.sentinel.encounters.dto.EncounterResponseDTO;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.mapper.EncounterMapper;
import com.sentinel.encounters.service.EncounterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/encounters")
public class EncounterController {

    private final EncounterService encounterService;
    private final AuditTrailService auditService;
    private final EncounterMapper encounterMapper;

    public EncounterController(EncounterService encounterService,
                               AuditTrailService auditService,
                               EncounterMapper encounterMapper) {
        this.encounterService = encounterService;
        this.auditService = auditService;
        this.encounterMapper = encounterMapper;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('CLINICAL_NOTE_READ', 'ENCOUNTER_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_ORG_ADMIN', 'ROLE_SYS_ADMIN') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<EncounterResponseDTO> getEncountersByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "ENCOUNTER", String.valueOf(patientId), "Accessed encounter & visit log history for patient ID: " + patientId);
        return encounterService.getEncountersByPatientId(patientId).stream()
                .map(encounterMapper::toResponseDTO)
                .toList();
    }

    /**
     * Creates a new clinical encounter. Restricted to clinical staff (Doctor, Nurse) and admins.
     * Receptionists are explicitly excluded as they do not perform clinical documentation.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('CLINICAL_NOTE_CREATE', 'ENCOUNTER_CREATE', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_ORG_ADMIN', 'ROLE_SYS_ADMIN') and (#payload != null and #payload.patientId != null and @abacEvaluator.hasTreatmentRelationship(authentication, #payload.patientId))")
    public ResponseEntity<EncounterResponseDTO> createEncounter(@Valid @RequestBody EncounterRequestDTO payload, Authentication auth) {
        Encounter entity = encounterMapper.toEntity(payload);

        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        if (payload.getAttendingProviderId() != null) {
            com.sentinel.users.entity.User u = new com.sentinel.users.entity.User();
            u.setId(payload.getAttendingProviderId());
            entity.setAttendingProvider(u);
        }

        Encounter saved = encounterService.createEncounter(entity, auth.getName());
        auditService.logAction(auth, "CREATE", "ENCOUNTER", String.valueOf(saved.getId()), "Logged new " + saved.getEncounterType() + " encounter for patient ID: " + saved.getPatient().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(encounterMapper.toResponseDTO(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CLINICAL_NOTE_CREATE', 'ENCOUNTER_UPDATE', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_ORG_ADMIN', 'ROLE_SYS_ADMIN') and @patientSecurityService.canAccessEncounter(authentication, #id)")
    public ResponseEntity<EncounterResponseDTO> updateEncounter(@PathVariable Long id, @Valid @RequestBody EncounterRequestDTO payload, Authentication auth) {
        Encounter updatedEntity = encounterMapper.toEntity(payload);
        Encounter saved = encounterService.updateEncounter(id, updatedEntity);
        auditService.logAction(auth, "UPDATE", "ENCOUNTER", String.valueOf(id), "Updated encounter details / clinical notes for ID: " + id);
        return ResponseEntity.ok(encounterMapper.toResponseDTO(saved));
    }
}
