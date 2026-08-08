package com.medvault.clinicalrecords.controller;

import com.medvault.audit.service.AuditTrailService;
import com.medvault.clinicalrecords.entity.MedicalRecord;
import com.medvault.clinicalrecords.repository.MedicalRecordRepository;
import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.users.entity.User;
import com.medvault.users.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/clinical-records", "/api/records"})
public class MedicalRecordController {

    private final MedicalRecordRepository recordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditService;

    public MedicalRecordController(MedicalRecordRepository recordRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository,
                                  AuditTrailService auditService) {
        this.recordRepository = recordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<MedicalRecord> getRecordsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "MEDICAL_RECORD", String.valueOf(patientId), "Fetched medical history for patient ID: " + patientId);
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and (#record != null and #record.patient != null and #record.patient.id != null and @abacEvaluator.hasTreatmentRelationship(authentication, #record.patient.id))")
    public ResponseEntity<?> createRecord(@RequestBody MedicalRecord record, Authentication auth) {
        if (record.getPatient() == null || record.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User doctor = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user profile not found"));
        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + record.getPatient().getId() + " not found"));

        record.setDoctor(doctor);
        record.setPatient(patient);

        MedicalRecord saved = recordRepository.save(record);
        auditService.logAction(auth, "CREATE", "MEDICAL_RECORD", String.valueOf(saved.getId()), "Created clinical encounter note for patient ID: " + patient.getId());

        return ResponseEntity.ok(saved);
    }
}
