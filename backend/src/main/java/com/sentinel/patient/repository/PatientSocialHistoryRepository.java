package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientSocialHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientSocialHistoryRepository extends JpaRepository<PatientSocialHistory, UUID> {
    List<PatientSocialHistory> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    Optional<PatientSocialHistory> findTopByPatientIdOrderByRecordedAtDesc(UUID patientId);
}
