package com.medvault.clinicalrecords.service;

import com.medvault.clinicalrecords.entity.MedicalRecord;
import com.medvault.clinicalrecords.repository.MedicalRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;

    public MedicalRecordService(MedicalRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    public List<MedicalRecord> getRecordsByPatientId(Long patientId) {
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public Optional<MedicalRecord> getRecordById(Long id) {
        return recordRepository.findById(id);
    }

    public MedicalRecord saveRecord(MedicalRecord record) {
        return recordRepository.save(record);
    }
}
