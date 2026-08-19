package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientSurgicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientSurgicalHistoryRepository extends JpaRepository<PatientSurgicalHistory, UUID> {
    List<PatientSurgicalHistory> findByPatientId(UUID patientId);
}
