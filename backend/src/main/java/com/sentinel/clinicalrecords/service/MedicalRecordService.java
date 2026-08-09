package com.sentinel.clinicalrecords.service;

import com.sentinel.clinicalrecords.entity.MedicalRecord;
import com.sentinel.clinicalrecords.repository.MedicalRecordRepository;
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
