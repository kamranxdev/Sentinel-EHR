package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.RecordVitalsRequest;
import com.sentinel.clinical.dto.VitalSearchCriteria;
import com.sentinel.clinical.dto.VitalsResponseDTO;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.entity.Vitals;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.repository.VitalsRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class VitalService {

    private final VitalsRepository vitalsRepository;
    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;

    public VitalService(VitalsRepository vitalsRepository,
                        EncounterRepository encounterRepository,
                        PatientRepository patientRepository) {
        this.vitalsRepository = vitalsRepository;
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
    }

    public VitalsResponseDTO recordVitals(UUID encounterId, RecordVitalsRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        Vitals vitals = new Vitals();
        vitals.setPatient(encounter.getPatient());
        vitals.setEncounter(encounter);
        vitals.setOrganization(encounter.getOrganization());
        vitals.setSystolicBp(request.getSystolicBp());
        vitals.setDiastolicBp(request.getDiastolicBp());
        vitals.setHeartRate(request.getHeartRate());
        vitals.setRespiratoryRate(request.getRespiratoryRate());
        vitals.setTemperature(request.getTemperature());
        vitals.setTemperatureUnit(request.getTemperatureUnit() != null ? request.getTemperatureUnit() : "C");
        vitals.setOxygenSaturation(request.getOxygenSaturation());
        vitals.setHeightCm(request.getHeightCm());
        vitals.setWeightKg(request.getWeightKg());
        vitals.setBloodGlucose(request.getBloodGlucose());
        vitals.setGlucoseUnit(request.getGlucoseUnit());
        vitals.setPainScore(request.getPainScore());
        vitals.setPosition(request.getPosition());
        vitals.setOxygenDeliveryMethod(request.getOxygenDeliveryMethod());
        vitals.setNotes(request.getNotes());
        vitals.setRecordedAt(OffsetDateTime.now());

        Vitals saved = vitalsRepository.save(vitals);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<VitalsResponseDTO> getEncounterVitals(UUID encounterId) {
        return vitalsRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VitalsResponseDTO> getPatientVitals(UUID patientId) {
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VitalsResponseDTO getLatestVitals(UUID patientId) {
        Vitals vitals = vitalsRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("No vitals recorded for patient: " + patientId));
        return mapToDTO(vitals);
    }

    public VitalsResponseDTO mapToDTO(Vitals v) {
        VitalsResponseDTO dto = new VitalsResponseDTO();
        dto.setId(v.getId());
        if (v.getPatient() != null) dto.setPatientId(v.getPatient().getId());
        if (v.getEncounter() != null) dto.setEncounterId(v.getEncounter().getId());
        dto.setSystolicBp(v.getSystolicBp());
        dto.setDiastolicBp(v.getDiastolicBp());
        dto.setMeanArterialPressure(v.getMeanArterialPressure());
        dto.setHeartRate(v.getHeartRate());
        dto.setRespiratoryRate(v.getRespiratoryRate());
        dto.setTemperature(v.getTemperature());
        dto.setTemperatureUnit(v.getTemperatureUnit());
        dto.setOxygenSaturation(v.getOxygenSaturation());
        dto.setHeightCm(v.getHeightCm());
        dto.setWeightKg(v.getWeightKg());
        dto.setBmi(v.getBmi());
        dto.setBloodGlucose(v.getBloodGlucose());
        dto.setGlucoseUnit(v.getGlucoseUnit());
        dto.setPainScore(v.getPainScore());
        dto.setPosition(v.getPosition());
        dto.setOxygenDeliveryMethod(v.getOxygenDeliveryMethod());
        dto.setNotes(v.getNotes());
        if (v.getRecordedBy() != null) dto.setRecordedByUsername(v.getRecordedBy().getUsername());
        dto.setRecordedAt(v.getRecordedAt());
        return dto;
    }
}
