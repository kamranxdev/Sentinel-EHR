package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientFamilyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientFamilyHistoryRepository extends JpaRepository<PatientFamilyHistory, UUID> {
    List<PatientFamilyHistory> findByPatientId(UUID patientId);
}
