package com.sentinel.vitals.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.vitals.dto.VitalSignDTO;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.repository.VitalsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("vitalSignService")
public class VitalSignService {

    private final VitalsRepository vitalsRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public VitalSignService(VitalsRepository vitalsRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository) {
        this.vitalsRepository = vitalsRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Vitals> getVitalsEntityByPatientId(Long patientId) {
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<VitalSignDTO> getVitalsByPatientId(Long patientId) {
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                .map(v -> {
                    VitalSignDTO dto = new VitalSignDTO();
                    dto.setId(v.getId());
                    dto.setPatientId(v.getPatient() != null ? v.getPatient().getId() : null);
                    dto.setPatientName(v.getPatient() != null ? v.getPatient().getFullName() : null);
                    dto.setBloodPressure(v.getBloodPressure());
                    dto.setHeartRate(v.getHeartRate());
                    dto.setTemperature(v.getTemperature());
                    dto.setOxygenSaturation(v.getOxygenSaturation());
                    dto.setRespiratoryRate(v.getRespiratoryRate());
                    dto.setWeightKg(v.getWeightKg());
                    dto.setHeightCm(v.getHeightCm());
                    dto.setBmi(v.getBmi());
                    dto.setBloodGlucose(v.getBloodGlucose());
                    dto.setRecordedAt(v.getRecordedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Vitals> getVitalsById(Long id) {
        return vitalsRepository.findById(id);
    }

    @Transactional
    public Vitals recordVitals(Vitals vitals, String staffUsername) {
        if (vitals.getPatient() == null || vitals.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        User staff = userRepository.findByUsername(staffUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user profile not found"));
        Patient patient = patientRepository.findById(vitals.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + vitals.getPatient().getId() + " not found"));

        vitals.setRecordedBy(staff);
        vitals.setPatient(patient);

        return vitalsRepository.save(vitals);
    }

    @Transactional
    public Vitals recordTelemetry(Vitals vitals, String staffUsername) {
        return recordVitals(vitals, staffUsername);
    }

    @Transactional
    public Vitals saveVitals(Vitals vitals) {
        return vitalsRepository.save(vitals);
    }
}

