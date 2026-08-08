package com.medvault.vitals.service;

import com.medvault.vitals.dto.VitalSignDTO;
import com.medvault.vitals.entity.Vitals;
import com.medvault.vitals.repository.VitalsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("vitalSignService")
public class VitalSignService {

    private final VitalsRepository vitalsRepository;

    public VitalSignService(VitalsRepository vitalsRepository) {
        this.vitalsRepository = vitalsRepository;
    }

    public List<Vitals> getVitalsEntityByPatientId(Long patientId) {
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

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

    public Optional<Vitals> getVitalsById(Long id) {
        return vitalsRepository.findById(id);
    }

    public Vitals saveVitals(Vitals vitals) {
        return vitalsRepository.save(vitals);
    }
}
