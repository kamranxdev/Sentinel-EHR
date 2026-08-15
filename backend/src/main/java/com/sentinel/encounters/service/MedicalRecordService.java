package com.sentinel.encounters.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.encounters.entity.MedicalRecord;
import com.sentinel.encounters.repository.MedicalRecordRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository recordRepository,
                                PatientRepository patientRepository,
                                UserRepository userRepository) {
        this.recordRepository = recordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<MedicalRecord> getRecordsByPatientId(Long patientId) {
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Optional<MedicalRecord> getRecordById(Long id) {
        return recordRepository.findById(id);
    }

    @Transactional
    public MedicalRecord createRecord(MedicalRecord record, String doctorUsername) {
        if (record.getPatient() == null || record.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User doctor = userRepository.findByUsername(doctorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user profile not found"));
        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + record.getPatient().getId() + " not found"));

        record.setDoctor(doctor);
        record.setPatient(patient);

        return recordRepository.save(record);
    }

    @Transactional
    public MedicalRecord saveRecord(MedicalRecord record) {
        return recordRepository.save(record);
    }
}
