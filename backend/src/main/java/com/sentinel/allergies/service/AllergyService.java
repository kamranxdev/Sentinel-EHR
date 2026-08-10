package com.sentinel.allergies.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public AllergyService(AllergyRepository allergyRepository,
                          PatientRepository patientRepository,
                          UserRepository userRepository) {
        this.allergyRepository = allergyRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Allergy> getAllergiesByPatientId(Long patientId) {
        return allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Optional<Allergy> getAllergyById(Long id) {
        return allergyRepository.findById(id);
    }

    @Transactional
    public Allergy createAllergy(Allergy allergy, String username) {
        if (allergy.getPatient() == null || allergy.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User clinician = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Clinician user profile not found"));
        Patient patient = patientRepository.findById(allergy.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + allergy.getPatient().getId() + " not found"));

        allergy.setRecordedBy(clinician);
        allergy.setPatient(patient);

        return allergyRepository.save(allergy);
    }

    @Transactional
    public Allergy saveAllergy(Allergy allergy) {
        return allergyRepository.save(allergy);
    }

    @Transactional
    public Allergy updateAllergyStatus(Long id, String status) {
        Allergy allergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy record with ID " + id + " not found"));
        allergy.setStatus(status);
        return allergyRepository.save(allergy);
    }
}

