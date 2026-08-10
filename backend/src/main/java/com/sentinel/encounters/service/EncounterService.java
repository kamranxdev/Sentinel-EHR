package com.sentinel.encounters.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EncounterService {

    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public EncounterService(EncounterRepository encounterRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository) {
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Encounter> getEncountersByPatientId(Long patientId) {
        return encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Optional<Encounter> getEncounterById(Long id) {
        return encounterRepository.findById(id);
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

        return encounterRepository.save(encounter);
    }

    @Transactional
    public Encounter updateEncounter(Long id, Encounter updated) {
        Encounter enc = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter record with ID " + id + " not found"));

        if (updated.getClinicalNotes() != null) enc.setClinicalNotes(updated.getClinicalNotes());
        if (updated.getDischargeSummary() != null) enc.setDischargeSummary(updated.getDischargeSummary());
        if (updated.getStatus() != null) enc.setStatus(updated.getStatus());

        return encounterRepository.save(enc);
    }

    @Transactional
    public Encounter saveEncounter(Encounter encounter) {
        return encounterRepository.save(encounter);
    }
}

