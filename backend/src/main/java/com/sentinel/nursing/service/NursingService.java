package com.sentinel.nursing.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.nursing.entity.EmarRecord;
import com.sentinel.nursing.entity.TriageEwsRecord;
import com.sentinel.nursing.repository.EmarRecordRepository;
import com.sentinel.nursing.repository.TriageEwsRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NursingService {

    private final TriageEwsRepository triageEwsRepository;
    private final EmarRecordRepository emarRecordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public NursingService(TriageEwsRepository triageEwsRepository,
                          EmarRecordRepository emarRecordRepository,
                          PatientRepository patientRepository,
                          UserRepository userRepository) {
        this.triageEwsRepository = triageEwsRepository;
        this.emarRecordRepository = emarRecordRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TriageEwsRecord submitTriage(TriageEwsRecord record, String staffUsername) {
        if (record.getPatient() == null || record.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User staff = userRepository.findByUsername(staffUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user profile not found"));
        Patient patient = patientRepository.findById(record.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID " + record.getPatient().getId()));

        record.setRecordedBy(staff);
        record.setPatient(patient);

        return triageEwsRepository.save(record);
    }

    @Transactional(readOnly = true)
    public List<TriageEwsRecord> getTriageRecordsForPatient(Long patientId) {
        return triageEwsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @Transactional
    public EmarRecord recordEmarAdministration(EmarRecord emar, String nurseUsername) {
        if (emar.getPatient() == null || emar.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User nurse = userRepository.findByUsername(nurseUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse user profile not found"));
        Patient patient = patientRepository.findById(emar.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID " + emar.getPatient().getId()));

        emar.setAdministeredBy(nurse);
        emar.setPatient(patient);

        return emarRecordRepository.save(emar);
    }

    @Transactional(readOnly = true)
    public List<EmarRecord> getEmarHistoryForPatient(Long patientId) {
        return emarRecordRepository.findByPatientIdOrderByAdministeredAtDesc(patientId);
    }
}
