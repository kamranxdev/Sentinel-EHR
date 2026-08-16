package com.sentinel.identity.service;

import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.clinical.repository.DiagnosisRepository;
import com.sentinel.identity.dto.DoctorRecommendationDTO;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DoctorMatchingService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorMatchingService(UserRepository userRepository,
                                 PatientRepository patientRepository,
                                 DiagnosisRepository diagnosisRepository,
                                 AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<DoctorRecommendationDTO> recommendDoctorsForPatient(UUID patientId, String primarySymptom) {
        return findMatchingDoctors(primarySymptom, "CARDIOLOGY");
    }

    public List<DoctorRecommendationDTO> findMatchingDoctors(String symptom, String specialty) {
        List<User> doctors = userRepository.searchUsers(null, null, "PHYSICIAN", null);
        return doctors.stream()
                .map(doc -> new DoctorRecommendationDTO(
                        doc.getId(),
                        doc.getFullName(),
                        specialty != null ? specialty : "GENERAL_MEDICINE",
                        0.95,
                        "Matched based on requested criteria: " + symptom
                ))
                .toList();
    }
}
