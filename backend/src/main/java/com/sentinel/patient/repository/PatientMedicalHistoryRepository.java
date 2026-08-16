package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientMedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientMedicalHistoryRepository extends JpaRepository<PatientMedicalHistory, UUID> {
    List<PatientMedicalHistory> findByPatientIdOrderByUpdatedAtDesc(UUID patientId);
    Optional<PatientMedicalHistory> findTopByPatientIdOrderByUpdatedAtDesc(UUID patientId);
}
