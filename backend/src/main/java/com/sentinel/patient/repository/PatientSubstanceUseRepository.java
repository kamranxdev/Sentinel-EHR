package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientSubstanceUse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientSubstanceUseRepository extends JpaRepository<PatientSubstanceUse, UUID> {
    List<PatientSubstanceUse> findByPatientId(UUID patientId);
}
