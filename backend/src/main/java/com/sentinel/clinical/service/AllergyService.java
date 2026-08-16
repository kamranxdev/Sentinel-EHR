package com.sentinel.clinical.service;

import com.sentinel.clinical.dto.AddAllergyRequest;
import com.sentinel.clinical.dto.AllergyResponseDTO;
import com.sentinel.clinical.dto.UpdateAllergyRequest;
import com.sentinel.clinical.entity.Allergy;
import com.sentinel.clinical.repository.AllergyRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;

    public AllergyService(AllergyRepository allergyRepository,
                          PatientRepository patientRepository,
                          PatientOrganizationRepository patientOrganizationRepository) {
        this.allergyRepository = allergyRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
    }

    @Transactional(readOnly = true)
    public List<AllergyResponseDTO> getAllergies(UUID patientId) {
        return allergyRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AllergyResponseDTO addAllergy(UUID patientId, AddAllergyRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        Allergy allergy = new Allergy();
        allergy.setPatient(patient);

        List<PatientOrganization> pos = patientOrganizationRepository.findByPatientId(patientId);
        if (!pos.isEmpty()) {
            allergy.setOrganization(pos.get(0).getOrganization());
        }

        allergy.setAllergenCode(request.getAllergenCode());
        allergy.setAllergenName(request.getAllergenName());
        allergy.setCategory(request.getCategory() != null ? request.getCategory() : "MEDICATION");
        allergy.setReaction(request.getReaction());
        allergy.setSeverity(request.getSeverity() != null ? request.getSeverity() : "MODERATE");
        allergy.setOnsetDate(request.getOnsetDate() != null ? request.getOnsetDate() : LocalDate.now());
        allergy.setStatus("ACTIVE");
        allergy.setVerificationStatus("UNCONFIRMED");
        allergy.setNotes(request.getNotes());
        allergy.setRecordedAt(OffsetDateTime.now());
        allergy.setUpdatedAt(OffsetDateTime.now());

        Allergy saved = allergyRepository.save(allergy);
        return mapToDTO(saved);
    }

    public AllergyResponseDTO updateAllergy(UUID allergyId, UpdateAllergyRequest request) {
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + allergyId));

        if (request.getAllergenName() != null) allergy.setAllergenName(request.getAllergenName());
        if (request.getCategory() != null) allergy.setCategory(request.getCategory());
        if (request.getReaction() != null) allergy.setReaction(request.getReaction());
        if (request.getSeverity() != null) allergy.setSeverity(request.getSeverity());
        if (request.getOnsetDate() != null) allergy.setOnsetDate(request.getOnsetDate());
        if (request.getStatus() != null) allergy.setStatus(request.getStatus());
        if (request.getVerificationStatus() != null) allergy.setVerificationStatus(request.getVerificationStatus());
        if (request.getNotes() != null) allergy.setNotes(request.getNotes());
        allergy.setUpdatedAt(OffsetDateTime.now());

        Allergy saved = allergyRepository.save(allergy);
        return mapToDTO(saved);
    }

    public AllergyResponseDTO verifyAllergy(UUID allergyId) {
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + allergyId));
        allergy.setVerificationStatus("CONFIRMED");
        allergy.setUpdatedAt(OffsetDateTime.now());
        Allergy saved = allergyRepository.save(allergy);
        return mapToDTO(saved);
    }

    public AllergyResponseDTO inactivateAllergy(UUID allergyId) {
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + allergyId));
        allergy.setStatus("INACTIVE");
        allergy.setUpdatedAt(OffsetDateTime.now());
        Allergy saved = allergyRepository.save(allergy);
        return mapToDTO(saved);
    }

    public AllergyResponseDTO mapToDTO(Allergy a) {
        AllergyResponseDTO dto = new AllergyResponseDTO();
        dto.setId(a.getId());
        if (a.getPatient() != null) dto.setPatientId(a.getPatient().getId());
        if (a.getOrganization() != null) dto.setOrganizationId(a.getOrganization().getId());
        dto.setAllergenCode(a.getAllergenCode());
        dto.setAllergenName(a.getAllergenName());
        dto.setCategory(a.getCategory());
        dto.setReaction(a.getReaction());
        dto.setSeverity(a.getSeverity());
        dto.setOnsetDate(a.getOnsetDate());
        dto.setStatus(a.getStatus());
        dto.setVerificationStatus(a.getVerificationStatus());
        dto.setNotes(a.getNotes());
        if (a.getRecordedBy() != null) dto.setRecordedByUsername(a.getRecordedBy().getUsername());
        dto.setRecordedAt(a.getRecordedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
