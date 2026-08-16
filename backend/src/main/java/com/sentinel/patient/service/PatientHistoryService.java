package com.sentinel.patient.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.dto.*;
import com.sentinel.patient.entity.*;
import com.sentinel.patient.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientHistoryService {

    private final PatientMedicalHistoryRepository medicalHistoryRepository;
    private final PatientFamilyHistoryRepository familyHistoryRepository;
    private final PatientSocialHistoryRepository socialHistoryRepository;
    private final PatientSubstanceUseRepository substanceUseRepository;
    private final PatientDietaryHistoryRepository dietaryHistoryRepository;
    private final PatientRepository patientRepository;

    public PatientHistoryService(PatientMedicalHistoryRepository medicalHistoryRepository,
                                 PatientFamilyHistoryRepository familyHistoryRepository,
                                 PatientSocialHistoryRepository socialHistoryRepository,
                                 PatientSubstanceUseRepository substanceUseRepository,
                                 PatientDietaryHistoryRepository dietaryHistoryRepository,
                                 PatientRepository patientRepository) {
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.familyHistoryRepository = familyHistoryRepository;
        this.socialHistoryRepository = socialHistoryRepository;
        this.substanceUseRepository = substanceUseRepository;
        this.dietaryHistoryRepository = dietaryHistoryRepository;
        this.patientRepository = patientRepository;
    }

    // Medical History
    @Transactional(readOnly = true)
    public PatientMedicalHistoryResponseDTO getMedicalHistory(UUID patientId) {
        PatientMedicalHistory history = medicalHistoryRepository.findTopByPatientIdOrderByUpdatedAtDesc(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical history not found for patient: " + patientId));
        return mapMedicalHistoryToDTO(history);
    }

    public PatientMedicalHistoryResponseDTO addMedicalHistory(UUID patientId, AddMedicalHistoryRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientMedicalHistory history = new PatientMedicalHistory();
        history.setPatient(patient);
        history.setPastMedicalHistory(request.getPastMedicalHistory());
        history.setPastSurgicalHistory(request.getPastSurgicalHistory());
        history.setFamilyHistory(request.getFamilyHistory());
        history.setSocialHistory(request.getSocialHistory());
        history.setUpdatedAt(OffsetDateTime.now());

        PatientMedicalHistory saved = medicalHistoryRepository.save(history);
        return mapMedicalHistoryToDTO(saved);
    }

    // Family History
    @Transactional(readOnly = true)
    public List<FamilyHistoryResponseDTO> getFamilyHistory(UUID patientId) {
        return familyHistoryRepository.findByPatientId(patientId).stream()
                .map(this::mapFamilyHistoryToDTO)
                .collect(Collectors.toList());
    }

    public FamilyHistoryResponseDTO addFamilyHistory(UUID patientId, CreateFamilyHistoryRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientFamilyHistory history = new PatientFamilyHistory();
        history.setPatient(patient);
        history.setRelationship(request.getRelationship());
        history.setConditionCode(request.getConditionCode());
        history.setConditionName(request.getConditionName());
        history.setAgeAtOnset(request.getAgeAtOnset());
        history.setDeceased(request.getDeceased());
        history.setCauseOfDeath(request.getCauseOfDeath());
        history.setNotes(request.getNotes());

        PatientFamilyHistory saved = familyHistoryRepository.save(history);
        return mapFamilyHistoryToDTO(saved);
    }

    public FamilyHistoryResponseDTO updateFamilyHistory(UUID id, UpdateFamilyHistoryRequest request) {
        PatientFamilyHistory history = familyHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family history record not found with id: " + id));

        if (request.getRelationship() != null) history.setRelationship(request.getRelationship());
        if (request.getConditionCode() != null) history.setConditionCode(request.getConditionCode());
        if (request.getConditionName() != null) history.setConditionName(request.getConditionName());
        if (request.getAgeAtOnset() != null) history.setAgeAtOnset(request.getAgeAtOnset());
        if (request.getDeceased() != null) history.setDeceased(request.getDeceased());
        if (request.getCauseOfDeath() != null) history.setCauseOfDeath(request.getCauseOfDeath());
        if (request.getNotes() != null) history.setNotes(request.getNotes());

        PatientFamilyHistory saved = familyHistoryRepository.save(history);
        return mapFamilyHistoryToDTO(saved);
    }

    public void deleteFamilyHistory(UUID id) {
        familyHistoryRepository.deleteById(id);
    }

    // Social History
    @Transactional(readOnly = true)
    public SocialHistoryResponseDTO getSocialHistory(UUID patientId) {
        PatientSocialHistory history = socialHistoryRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Social history not found for patient: " + patientId));
        return mapSocialHistoryToDTO(history);
    }

    public SocialHistoryResponseDTO updateSocialHistory(UUID patientId, UpdateSocialHistoryRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientSocialHistory history = socialHistoryRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseGet(() -> {
                    PatientSocialHistory newHistory = new PatientSocialHistory();
                    newHistory.setPatient(patient);
                    return newHistory;
                });

        if (request.getSmokingStatus() != null) history.setSmokingStatus(request.getSmokingStatus());
        if (request.getSmokingQuantity() != null) history.setSmokingQuantity(request.getSmokingQuantity());
        if (request.getSmokingStartDate() != null) history.setSmokingStartDate(request.getSmokingStartDate());
        if (request.getSmokingQuitDate() != null) history.setSmokingQuitDate(request.getSmokingQuitDate());
        if (request.getAlcoholStatus() != null) history.setAlcoholStatus(request.getAlcoholStatus());
        if (request.getAlcoholQuantity() != null) history.setAlcoholQuantity(request.getAlcoholQuantity());
        if (request.getAlcoholFrequency() != null) history.setAlcoholFrequency(request.getAlcoholFrequency());
        if (request.getExerciseFrequency() != null) history.setExerciseFrequency(request.getExerciseFrequency());
        if (request.getExerciseDescription() != null) history.setExerciseDescription(request.getExerciseDescription());
        if (request.getOccupation() != null) history.setOccupation(request.getOccupation());
        if (request.getLivingSituation() != null) history.setLivingSituation(request.getLivingSituation());
        if (request.getNotes() != null) history.setNotes(request.getNotes());
        history.setRecordedAt(OffsetDateTime.now());

        PatientSocialHistory saved = socialHistoryRepository.save(history);
        return mapSocialHistoryToDTO(saved);
    }

    // Substance Use
    @Transactional(readOnly = true)
    public List<SubstanceUseResponseDTO> getSubstanceUse(UUID patientId) {
        return substanceUseRepository.findByPatientId(patientId).stream()
                .map(this::mapSubstanceUseToDTO)
                .collect(Collectors.toList());
    }

    public SubstanceUseResponseDTO addSubstanceUse(UUID patientId, AddSubstanceUseRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientSubstanceUse substance = new PatientSubstanceUse();
        substance.setPatient(patient);
        substance.setSubstanceName(request.getSubstanceName());
        substance.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        substance.setRoute(request.getRoute());
        substance.setFrequency(request.getFrequency());
        substance.setQuantity(request.getQuantity());
        substance.setStartDate(request.getStartDate());
        substance.setEndDate(request.getEndDate());
        substance.setNotes(request.getNotes());

        PatientSubstanceUse saved = substanceUseRepository.save(substance);
        return mapSubstanceUseToDTO(saved);
    }

    // Dietary History
    @Transactional(readOnly = true)
    public DietaryHistoryResponseDTO getDietaryHistory(UUID patientId) {
        PatientDietaryHistory history = dietaryHistoryRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Dietary history not found for patient: " + patientId));
        return mapDietaryHistoryToDTO(history);
    }

    public DietaryHistoryResponseDTO updateDietaryHistory(UUID patientId, UpdateDietaryHistoryRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientDietaryHistory history = dietaryHistoryRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseGet(() -> {
                    PatientDietaryHistory newHistory = new PatientDietaryHistory();
                    newHistory.setPatient(patient);
                    return newHistory;
                });

        if (request.getDietType() != null) history.setDietType(request.getDietType());
        if (request.getDietaryRestrictions() != null) history.setDietaryRestrictions(request.getDietaryRestrictions());
        if (request.getFoodPreferences() != null) history.setFoodPreferences(request.getFoodPreferences());
        if (request.getNutritionalNotes() != null) history.setNutritionalNotes(request.getNutritionalNotes());
        history.setRecordedAt(OffsetDateTime.now());

        PatientDietaryHistory saved = dietaryHistoryRepository.save(history);
        return mapDietaryHistoryToDTO(saved);
    }

    private PatientMedicalHistoryResponseDTO mapMedicalHistoryToDTO(PatientMedicalHistory h) {
        PatientMedicalHistoryResponseDTO dto = new PatientMedicalHistoryResponseDTO();
        dto.setId(h.getId());
        if (h.getPatient() != null) dto.setPatientId(h.getPatient().getId());
        dto.setPastMedicalHistory(h.getPastMedicalHistory());
        dto.setPastSurgicalHistory(h.getPastSurgicalHistory());
        dto.setFamilyHistory(h.getFamilyHistory());
        dto.setSocialHistory(h.getSocialHistory());
        dto.setUpdatedAt(h.getUpdatedAt());
        return dto;
    }

    private FamilyHistoryResponseDTO mapFamilyHistoryToDTO(PatientFamilyHistory f) {
        FamilyHistoryResponseDTO dto = new FamilyHistoryResponseDTO();
        dto.setId(f.getId());
        if (f.getPatient() != null) dto.setPatientId(f.getPatient().getId());
        dto.setRelationship(f.getRelationship());
        dto.setConditionCode(f.getConditionCode());
        dto.setConditionName(f.getConditionName());
        dto.setAgeAtOnset(f.getAgeAtOnset());
        dto.setDeceased(f.getDeceased());
        dto.setCauseOfDeath(f.getCauseOfDeath());
        dto.setNotes(f.getNotes());
        return dto;
    }

    private SocialHistoryResponseDTO mapSocialHistoryToDTO(PatientSocialHistory s) {
        SocialHistoryResponseDTO dto = new SocialHistoryResponseDTO();
        dto.setId(s.getId());
        if (s.getPatient() != null) dto.setPatientId(s.getPatient().getId());
        dto.setSmokingStatus(s.getSmokingStatus());
        dto.setSmokingQuantity(s.getSmokingQuantity());
        dto.setSmokingStartDate(s.getSmokingStartDate());
        dto.setSmokingQuitDate(s.getSmokingQuitDate());
        dto.setAlcoholStatus(s.getAlcoholStatus());
        dto.setAlcoholQuantity(s.getAlcoholQuantity());
        dto.setAlcoholFrequency(s.getAlcoholFrequency());
        dto.setExerciseFrequency(s.getExerciseFrequency());
        dto.setExerciseDescription(s.getExerciseDescription());
        dto.setOccupation(s.getOccupation());
        dto.setLivingSituation(s.getLivingSituation());
        dto.setNotes(s.getNotes());
        dto.setRecordedAt(s.getRecordedAt());
        return dto;
    }

    private SubstanceUseResponseDTO mapSubstanceUseToDTO(PatientSubstanceUse su) {
        SubstanceUseResponseDTO dto = new SubstanceUseResponseDTO();
        dto.setId(su.getId());
        if (su.getPatient() != null) dto.setPatientId(su.getPatient().getId());
        dto.setSubstanceName(su.getSubstanceName());
        dto.setStatus(su.getStatus());
        dto.setRoute(su.getRoute());
        dto.setFrequency(su.getFrequency());
        dto.setQuantity(su.getQuantity());
        dto.setStartDate(su.getStartDate());
        dto.setEndDate(su.getEndDate());
        dto.setNotes(su.getNotes());
        return dto;
    }

    private DietaryHistoryResponseDTO mapDietaryHistoryToDTO(PatientDietaryHistory d) {
        DietaryHistoryResponseDTO dto = new DietaryHistoryResponseDTO();
        dto.setId(d.getId());
        if (d.getPatient() != null) dto.setPatientId(d.getPatient().getId());
        dto.setDietType(d.getDietType());
        dto.setDietaryRestrictions(d.getDietaryRestrictions());
        dto.setFoodPreferences(d.getFoodPreferences());
        dto.setNutritionalNotes(d.getNutritionalNotes());
        dto.setRecordedAt(d.getRecordedAt());
        return dto;
    }
}
