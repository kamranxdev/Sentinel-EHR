package com.sentinel.allergies.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AllergyService {

    private final AllergyRepository allergyRepository;

    public AllergyService(AllergyRepository allergyRepository) {
        this.allergyRepository = allergyRepository;
    }

    public List<Allergy> getAllergiesByPatientId(Long patientId) {
        return allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    public Optional<Allergy> getAllergyById(Long id) {
        return allergyRepository.findById(id);
    }

    public Allergy saveAllergy(Allergy allergy) {
        return allergyRepository.save(allergy);
    }

    public Allergy updateAllergyStatus(Long id, String status) {
        Allergy allergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy record with ID " + id + " not found"));
        allergy.setStatus(status);
        return allergyRepository.save(allergy);
    }
}
