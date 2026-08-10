package com.sentinel.diagnoses.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public DiagnosisService(DiagnosisRepository diagnosisRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository) {
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Diagnosis> getDiagnosesByPatientId(Long patientId) {
        return diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Optional<Diagnosis> getDiagnosisById(Long id) {
        return diagnosisRepository.findById(id);
    }

    @Transactional
    public Diagnosis createDiagnosis(Diagnosis diagnosis, String doctorUsername) {
        if (diagnosis.getPatient() == null || diagnosis.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User doctor = userRepository.findByUsername(doctorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user profile not found"));
        Patient patient = patientRepository.findById(diagnosis.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + diagnosis.getPatient().getId() + " not found"));

        diagnosis.setDoctor(doctor);
        diagnosis.setPatient(patient);

        return diagnosisRepository.save(diagnosis);
    }

    @Transactional
    public Diagnosis saveDiagnosis(Diagnosis diagnosis) {
        return diagnosisRepository.save(diagnosis);
    }

    @Transactional
    public Diagnosis updateDiagnosisStatus(Long id, String status) {
        Diagnosis diag = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis record with ID " + id + " not found"));
        diag.setStatus(status);
        return diagnosisRepository.save(diag);
    }
}

