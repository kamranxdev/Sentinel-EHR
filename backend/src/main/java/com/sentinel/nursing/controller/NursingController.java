package com.sentinel.nursing.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.nursing.entity.EmarRecord;
import com.sentinel.nursing.entity.TriageEwsRecord;
import com.sentinel.nursing.repository.EmarRecordRepository;
import com.sentinel.nursing.repository.TriageEwsRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/nursing", "/api/nursing"})
public class NursingController {

    private final TriageEwsRepository triageEwsRepository;
    private final EmarRecordRepository emarRecordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditService;

    public NursingController(TriageEwsRepository triageEwsRepository,
                             EmarRecordRepository emarRecordRepository,
                             PatientRepository patientRepository,
                             UserRepository userRepository,
                             AuditTrailService auditService) {
        this.triageEwsRepository = triageEwsRepository;
        this.emarRecordRepository = emarRecordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // --- 1. CLINICAL TRIAGE ---
    @PostMapping({"/triage", "/triage-ews"})
    @PreAuthorize("hasAnyAuthority('VITALS_CREATE', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<?> submitTriage(@RequestBody TriageEwsRecord record, Authentication auth) {
        if (record.getPatient() == null || record.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User staff = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Staff user profile not found"));
        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID " + record.getPatient().getId()));

        record.setRecordedBy(staff);
        record.setPatient(patient);

        TriageEwsRecord saved = triageEwsRepository.save(record);
        auditService.logAction(auth, "CREATE", "CLINICAL_TRIAGE", String.valueOf(saved.getId()), 
                "Recorded triage intake (" + saved.getTriagePriority() + ") for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }

    @GetMapping({"/triage/patient/{patientId}", "/triage-ews/patient/{patientId}"})
    @PreAuthorize("hasAnyAuthority('VITALS_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN')")
    public List<TriageEwsRecord> getTriageRecordsForPatient(@PathVariable Long patientId, Authentication auth) {
        return triageEwsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    // --- 2. eMAR MEDICATION ADMINISTRATION ---
    @PostMapping("/emar/administer")
    @PreAuthorize("hasAnyAuthority('MAR_ADMINISTER', 'ROLE_NURSE', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<?> recordEmarAdministration(@RequestBody EmarRecord emar, Authentication auth) {
        if (emar.getPatient() == null || emar.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User nurse = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Nurse user profile not found"));
        Patient patient = patientRepository.findById(emar.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID " + emar.getPatient().getId()));

        emar.setAdministeredBy(nurse);
        emar.setPatient(patient);

        EmarRecord saved = emarRecordRepository.save(emar);
        auditService.logAction(auth, "CREATE", "EMAR_ADMINISTER", String.valueOf(saved.getId()), 
                "Logged eMAR administration of " + saved.getMedicationName() + " (" + saved.getDose() + ") for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/emar/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('MAR_READ', 'PRESCRIPTION_READ', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_PHARMACIST', 'ROLE_SYS_ADMIN')")
    public List<EmarRecord> getEmarHistoryForPatient(@PathVariable Long patientId, Authentication auth) {
        return emarRecordRepository.findByPatientIdOrderByAdministeredAtDesc(patientId);
    }
}
