package com.sentinel.patients.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.patients.dto.PatientClinicalHistoryDTO;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.service.PatientSecurityService;
import com.sentinel.patients.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/patients", "/api/patients"})
public class PatientController {

    private final PatientService patientService;
    private final AuditTrailService auditService;
    private final PatientSecurityService patientSecurityService;

    public PatientController(PatientService patientService,
                             AuditTrailService auditService,
                             PatientSecurityService patientSecurityService) {
        this.patientService = patientService;
        this.auditService = auditService;
        this.patientSecurityService = patientSecurityService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PATIENT_READ', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST')")
    public List<Patient> getAllPatients(@RequestParam(value = "search", required = false) String search, Authentication auth) {
        auditService.logAction(auth, "READ_ALL", "PATIENT_LIST", "0", "Retrieved Master Patient Index roster");
        return patientService.getAllPatients(search);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id, Authentication auth) {
        Patient patient = patientService.getPatientById(id);

        boolean isPatientSelf = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

        if (isPatientSelf) {
            auditService.logAction(auth, "READ_SELF", "PATIENT_PROFILE", String.valueOf(id), "Patient accessed their personal medical profile");
        } else {
            auditService.logAction(auth, "READ", "PATIENT", String.valueOf(id), "Viewed patient record for " + patient.getFullName() + " (MRN: " + patient.getPatientCode() + ")");
        }

        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{id}/clinical-history")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_READ') and @patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<PatientClinicalHistoryDTO> getPatientClinicalHistory(@PathVariable Long id, Authentication auth) {
        PatientClinicalHistoryDTO historyDTO = patientService.getPatientClinicalHistory(id);
        auditService.logAction(auth, "READ", "CLINICAL_HISTORY", String.valueOf(id), "Accessed longitudinal clinical history for patient ID: " + id);
        return ResponseEntity.ok(historyDTO);
    }

    @PostMapping("/intake")
    @PreAuthorize("hasAnyAuthority('PATIENT_CREATE', 'ROLE_RECEPTIONIST', 'ROLE_INTAKE_SPEC', 'ROLE_ADMIN', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<Patient> registerIntakePatient(@RequestBody Patient patient, Authentication auth) {
        Patient saved = patientService.registerIntakePatient(patient);
        auditService.logAction(auth, "PATIENT_INTAKE_REGISTER", "PATIENT_DEMOGRAPHICS", String.valueOf(saved.getId()),
                String.format("Completed Reception Desk Intake Registration for %s (MRN: %s, Carrier: %s)",
                        saved.getFullName(), saved.getPatientCode(), saved.getInsuranceProvider() != null ? saved.getInsuranceProvider() : "Self-Pay"));

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/me")
    public ResponseEntity<Patient> getMyPatientProfile(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Patient patient = patientService.getPatientByUsernameOrEmail(auth.getName());
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("@patientSecurityService.canAccessUser(authentication, #userId)")
    public ResponseEntity<Patient> getPatientByUserId(@PathVariable Long userId, Authentication auth) {
        Patient patient = patientService.getPatientByUserId(userId);
        auditService.logAction(auth, "READ", "PATIENT_BY_USER", String.valueOf(userId), "Accessed patient profile linked to user ID: " + userId);
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT_CREATE')")
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient, Authentication auth) {
        Patient saved = patientService.createPatient(patient);
        auditService.logAction(auth, "CREATE", "PATIENT", String.valueOf(saved.getId()), "Created demographic identity profile for " + saved.getFullName() + " (MRN: " + saved.getPatientCode() + ")");

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient updated, Authentication auth) {
        Patient saved = patientService.updatePatient(id, updated);
        auditService.logAction(auth, "UPDATE", "PATIENT", String.valueOf(id), "Updated demographic profile for patient ID: " + id);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id, Authentication auth) {
        Patient patient = patientService.getPatientById(id);
        patientService.deletePatient(id);
        auditService.logAction(auth, "DELETE", "PATIENT", String.valueOf(id), "Deleted patient record MRN: " + patient.getPatientCode());

        return ResponseEntity.noContent().build();
    }
}

