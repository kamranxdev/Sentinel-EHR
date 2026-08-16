package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientConditionRepository extends JpaRepository<PatientCondition, UUID> {
    List<PatientCondition> findByPatientId(UUID patientId);
    List<PatientCondition> findByPatientIdAndStatus(UUID patientId, String status);
}
