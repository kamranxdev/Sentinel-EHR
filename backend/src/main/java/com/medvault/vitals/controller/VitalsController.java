package com.medvault.vitals.controller;

import com.medvault.audit.service.AuditTrailService;
import com.medvault.authorization.evaluator.ABACEvaluator;
import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.users.entity.User;
import com.medvault.users.repository.UserRepository;
import com.medvault.vitals.entity.Vitals;
import com.medvault.vitals.repository.VitalsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("vitalSignController")
@RequestMapping({"/api/v1/vitals", "/api/vitals"})
public class VitalsController {

    private final VitalsRepository vitalsRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditService;
    private final ABACEvaluator abacEvaluator;

    public VitalsController(VitalsRepository vitalsRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository,
                            AuditTrailService auditService,
                            ABACEvaluator abacEvaluator) {
        this.vitalsRepository = vitalsRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
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
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VITALS_CREATE') and (#vitals != null and #vitals.patient != null and #vitals.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #vitals.patient.id))")
    public ResponseEntity<?> recordVitals(@RequestBody Vitals vitals, Authentication auth) {
        if (vitals.getPatient() == null || vitals.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User staff = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Staff user profile not found"));
        Patient patient = patientRepository.findById(vitals.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + vitals.getPatient().getId() + " not found"));

        vitals.setRecordedBy(staff);
        vitals.setPatient(patient);

        Vitals saved = vitalsRepository.save(vitals);
        auditService.logAction(auth, "CREATE", "VITALS", String.valueOf(saved.getId()), 
                "Recorded vital signs (BP: " + saved.getBloodPressure() + ", Pulse: " + saved.getHeartRate() 
                + " bpm, Glucose: " + (saved.getBloodGlucose() != null ? saved.getBloodGlucose() + " mg/dL" : "N/A") 
                + ", BMI: " + (saved.getBmi() != null ? saved.getBmi() : "N/A") + ") for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }
}
