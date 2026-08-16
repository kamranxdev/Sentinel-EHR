package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientDemographics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientDemographicsRepository extends JpaRepository<PatientDemographics, UUID> {
    Optional<PatientDemographics> findByPatientId(UUID patientId);
}
