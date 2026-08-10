package com.sentinel.prescriptions.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.prescriptions.dto.SafetyCheckResultDTO;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final SmartSafetyService safetyService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PatientRepository patientRepository,
                               UserRepository userRepository,
                               SmartSafetyService safetyService) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.safetyService = safetyService;
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public SafetyCheckResultDTO validateSafety(Long patientId, String medicationName, String username, String userRole) {
        return safetyService.checkPrescriptionSafety(patientId, medicationName, username, userRole);
    }

    @Transactional
    public Prescription createPrescription(Prescription prescription, String doctorUsername) {
        if (prescription.getPatient() == null || prescription.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required for prescription creation");
        }

        User doctor = userRepository.findByUsername(doctorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Prescribing doctor user not found: " + doctorUsername));
        Patient patient = patientRepository.findById(prescription.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + prescription.getPatient().getId() + " not found"));

        prescription.setDoctor(doctor);
        prescription.setPatient(patient);

        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription savePrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updateStatus(Long id, String status) {
        Prescription rx = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription with ID " + id + " not found"));
        rx.setStatus(status);
        return prescriptionRepository.save(rx);
    }
}
