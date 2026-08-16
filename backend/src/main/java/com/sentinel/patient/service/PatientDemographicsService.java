package com.sentinel.patient.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.dto.PatientDemographicsResponseDTO;
import com.sentinel.patient.dto.UpdateDemographicsRequest;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientDemographics;
import com.sentinel.patient.repository.PatientDemographicsRepository;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class PatientDemographicsService {

    private final PatientDemographicsRepository demographicsRepository;
    private final PatientRepository patientRepository;

    public PatientDemographicsService(PatientDemographicsRepository demographicsRepository, PatientRepository patientRepository) {
        this.demographicsRepository = demographicsRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public PatientDemographicsResponseDTO getDemographics(UUID patientId) {
        PatientDemographics demo = demographicsRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Demographics not found for patient: " + patientId));
        return mapToDTO(demo);
    }

    public PatientDemographicsResponseDTO updateDemographics(UUID patientId, UpdateDemographicsRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientDemographics demo = demographicsRepository.findByPatientId(patientId)
                .orElseGet(() -> {
                    PatientDemographics newDemo = new PatientDemographics();
                    newDemo.setPatient(patient);
                    return newDemo;
                });

        if (request.getRace() != null) demo.setRace(request.getRace());
        if (request.getEthnicity() != null) demo.setEthnicity(request.getEthnicity());
        if (request.getReligion() != null) demo.setReligion(request.getReligion());
        if (request.getBloodGroup() != null) demo.setBloodGroup(request.getBloodGroup());
        if (request.getRhFactor() != null) demo.setRhFactor(request.getRhFactor());

        PatientDemographics saved = demographicsRepository.save(demo);
        return mapToDTO(saved);
    }

    public PatientDemographicsResponseDTO mapToDTO(PatientDemographics demo) {
        PatientDemographicsResponseDTO dto = new PatientDemographicsResponseDTO();
        dto.setId(demo.getId());
        if (demo.getPatient() != null) dto.setPatientId(demo.getPatient().getId());
        dto.setRace(demo.getRace());
        dto.setEthnicity(demo.getEthnicity());
        dto.setReligion(demo.getReligion());
        dto.setBloodGroup(demo.getBloodGroup());
        dto.setRhFactor(demo.getRhFactor());
        return dto;
    }
}
