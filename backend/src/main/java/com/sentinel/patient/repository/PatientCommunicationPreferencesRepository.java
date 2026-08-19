package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientCommunicationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientCommunicationPreferencesRepository extends JpaRepository<PatientCommunicationPreferences, UUID> {
    Optional<PatientCommunicationPreferences> findByPatientId(UUID patientId);
}
