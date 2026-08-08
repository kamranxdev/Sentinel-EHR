package com.medvault.patients.service;

import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient getPatientByCode(String code) {
        return patientRepository.findByPatientCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with MRN: " + code));
    }

    public List<Patient> searchPatients(String query) {
        return patientRepository.searchPatients(query);
    }

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }
}
