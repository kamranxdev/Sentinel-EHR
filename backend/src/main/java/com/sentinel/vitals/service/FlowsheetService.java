package com.sentinel.vitals.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.vitals.entity.FlowsheetEntry;
import com.sentinel.vitals.repository.FlowsheetEntryRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlowsheetService {

    private final FlowsheetEntryRepository flowsheetEntryRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditTrailService;

    public FlowsheetService(FlowsheetEntryRepository flowsheetEntryRepository,
                            PatientRepository patientRepository,
                            EncounterRepository encounterRepository,
                            UserRepository userRepository,
                            AuditTrailService auditTrailService) {
        this.flowsheetEntryRepository = flowsheetEntryRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.userRepository = userRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional(readOnly = true)
    public List<FlowsheetEntry> getEntriesByPatient(Long patientId) {
        return flowsheetEntryRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<FlowsheetEntry> getEntriesByEncounter(Long encounterId) {
        return flowsheetEntryRepository.findByEncounterIdOrderByRecordedAtDesc(encounterId);
    }

    @Transactional
    public FlowsheetEntry createEntry(Long patientId, Long encounterId, FlowsheetEntry entryData, String username) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + patientId + " not found"));

        User recordedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User " + username + " not found"));

        Encounter encounter = encounterId != null ? encounterRepository.findById(encounterId).orElse(null) : null;

        entryData.setPatient(patient);
        entryData.setEncounter(encounter);
        entryData.setRecordedBy(recordedBy);
        entryData.setRecordedAt(LocalDateTime.now());

        if (entryData.getBloodPressureSystolic() != null && entryData.getBloodPressureDiastolic() != null) {
            double map = (entryData.getBloodPressureSystolic() + 2 * entryData.getBloodPressureDiastolic()) / 3.0;
            entryData.setMeanArterialPressure(Math.round(map * 10.0) / 10.0);
        }

        FlowsheetEntry saved = flowsheetEntryRepository.save(entryData);
        auditTrailService.logAction(username, "CREATE_FLOWSHEET_ENTRY", "FLOWSHEET_ENTRY", saved.getId().toString(), "Recorded continuous nursing flowsheet entry for patient " + patient.getFullName());
        return saved;
    }
}
