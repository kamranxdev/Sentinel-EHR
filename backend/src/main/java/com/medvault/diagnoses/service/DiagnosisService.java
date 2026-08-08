package com.medvault.diagnoses.service;

import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.diagnoses.entity.Diagnosis;
import com.medvault.diagnoses.repository.DiagnosisRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;

    public DiagnosisService(DiagnosisRepository diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }

    public List<Diagnosis> getDiagnosesByPatientId(Long patientId) {
        return diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    public Optional<Diagnosis> getDiagnosisById(Long id) {
        return diagnosisRepository.findById(id);
    }

    public Diagnosis saveDiagnosis(Diagnosis diagnosis) {
        return diagnosisRepository.save(diagnosis);
    }

    public Diagnosis updateDiagnosisStatus(Long id, String status) {
        Diagnosis diag = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis record with ID " + id + " not found"));
        diag.setStatus(status);
        return diagnosisRepository.save(diag);
    }
}
