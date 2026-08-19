package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientIdentifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientIdentifierRepository extends JpaRepository<PatientIdentifier, UUID> {
    List<PatientIdentifier> findByPatientId(UUID patientId);
    Optional<PatientIdentifier> findByIdentifierTypeAndIdentifierValue(String identifierType, String identifierValue);
}
