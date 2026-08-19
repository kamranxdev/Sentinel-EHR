package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientDietaryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientDietaryHistoryRepository extends JpaRepository<PatientDietaryHistory, UUID> {
    List<PatientDietaryHistory> findByPatientId(UUID patientId);
    List<PatientDietaryHistory> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    Optional<PatientDietaryHistory> findTopByPatientIdOrderByRecordedAtDesc(UUID patientId);
}
