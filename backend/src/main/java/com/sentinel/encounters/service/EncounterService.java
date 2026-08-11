package com.sentinel.encounters.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Bed;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.BedRepository;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EncounterService {

    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final BedRepository bedRepository;
    private final AuditTrailService auditTrailService;

    public EncounterService(EncounterRepository encounterRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository,
                            BedRepository bedRepository,
                            AuditTrailService auditTrailService) {
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.bedRepository = bedRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional(readOnly = true)
    public List<Encounter> getEncountersByPatientId(Long patientId) {
        return encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Optional<Encounter> getEncounterById(Long id) {
        return encounterRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Encounter> getAllEncounters() {
        return encounterRepository.findAll();
    }

    @Transactional
    public Encounter createEncounter(Encounter encounter, String providerUsername) {
        if (encounter.getPatient() == null || encounter.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User provider = userRepository.findByUsername(providerUsername).orElse(null);
        Patient patient = patientRepository.findById(encounter.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + encounter.getPatient().getId() + " not found"));

        if (encounter.getAttendingProvider() == null || encounter.getAttendingProvider().getId() == null) {
            encounter.setAttendingProvider(provider);
        } else {
            User assigned = userRepository.findById(encounter.getAttendingProvider().getId()).orElse(provider);
            encounter.setAttendingProvider(assigned);
        }
        encounter.setPatient(patient);

        if (encounter.getStatus() == null) {
            encounter.setStatus("ADMITTED");
        }

        Encounter saved = encounterRepository.save(encounter);
        auditTrailService.logAction(providerUsername != null ? providerUsername : "SYSTEM", "CREATE_ENCOUNTER", "ENCOUNTER", saved.getId().toString(), "Created " + saved.getEncounterType() + " encounter for patient " + patient.getFullName());
        return saved;
    }

    /**
     * Backend-Enforced Inpatient Lifecycle State Transitions:
     * ADMISSION_REQUESTED -> ADMITTED -> BED_ASSIGNED -> INPATIENT_ACTIVE -> DISCHARGE_PLANNED -> DISCHARGED -> ENCOUNTER_CLOSED
     */
    @Transactional
    public Encounter updateEncounterStatus(Long id, String targetStatus, String providerUsername) {
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter record with ID " + id + " not found"));

        String currentStatus = encounter.getStatus() != null ? encounter.getStatus() : "ADMITTED";

        // Validate allowed state transitions
        if (!isValidTransition(currentStatus, targetStatus)) {
            throw new IllegalStateException("Invalid Inpatient State Transition from '" + currentStatus + "' to '" + targetStatus + "'. Transition rules must be strictly obeyed.");
        }

        encounter.setStatus(targetStatus);

        if ("DISCHARGED".equalsIgnoreCase(targetStatus)) {
            encounter.setDischargeTime(LocalDateTime.now());
            // Release bed if assigned
            if (encounter.getAssignedBed() != null) {
                Bed bed = encounter.getAssignedBed();
                bed.setStatus("CLEANING_REQUIRED");
                bed.setCurrentEncounter(null);
                bedRepository.save(bed);
                encounter.setAssignedBed(null);
            }
        }

        Encounter saved = encounterRepository.save(encounter);
        auditTrailService.logAction(providerUsername != null ? providerUsername : "SYSTEM", "TRANSITION_ENCOUNTER_STATUS", "ENCOUNTER", saved.getId().toString(), "Transitioned encounter status from " + currentStatus + " to " + targetStatus);
        return saved;
    }

    private boolean isValidTransition(String current, String target) {
        if (current.equals(target)) return true;

        return switch (current) {
            case "ADMISSION_REQUESTED" -> "ADMITTED".equalsIgnoreCase(target) || "CANCELLED".equalsIgnoreCase(target);
            case "ADMITTED" -> "BED_ASSIGNED".equalsIgnoreCase(target) || "INPATIENT_ACTIVE".equalsIgnoreCase(target) || "CANCELLED".equalsIgnoreCase(target);
            case "BED_ASSIGNED" -> "INPATIENT_ACTIVE".equalsIgnoreCase(target) || "CANCELLED".equalsIgnoreCase(target);
            case "INPATIENT_ACTIVE" -> "DISCHARGE_PLANNED".equalsIgnoreCase(target) || "DISCHARGED".equalsIgnoreCase(target);
            case "DISCHARGE_PLANNED" -> "DISCHARGED".equalsIgnoreCase(target);
            case "DISCHARGED" -> "ENCOUNTER_CLOSED".equalsIgnoreCase(target);
            default -> false;
        };
    }

    @Transactional
    public Encounter updateEncounter(Long id, Encounter updated) {
        Encounter enc = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter record with ID " + id + " not found"));

        if (updated.getClinicalNotes() != null) enc.setClinicalNotes(updated.getClinicalNotes());
        if (updated.getDischargeSummary() != null) enc.setDischargeSummary(updated.getDischargeSummary());
        if (updated.getChiefComplaint() != null) enc.setChiefComplaint(updated.getChiefComplaint());
        if (updated.getAdmissionDiagnosisIcd() != null) enc.setAdmissionDiagnosisIcd(updated.getAdmissionDiagnosisIcd());

        if (updated.getStatus() != null && !updated.getStatus().equalsIgnoreCase(enc.getStatus())) {
            return updateEncounterStatus(id, updated.getStatus(), "SYSTEM");
        }

        return encounterRepository.save(enc);
    }

    @Transactional
    public Encounter saveEncounter(Encounter encounter) {
        return encounterRepository.save(encounter);
    }
}
