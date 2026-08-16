package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.ClinicalObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClinicalObservationRepository extends JpaRepository<ClinicalObservation, UUID> {
    List<ClinicalObservation> findByEncounterId(UUID encounterId);
    List<ClinicalObservation> findByPatientId(UUID patientId);
}
