package com.sentinel.consent.repository;

import com.sentinel.consent.entity.PatientConsent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientConsentRepository extends JpaRepository<PatientConsent, UUID> {
    List<PatientConsent> findByPatientId(UUID patientId);
    List<PatientConsent> findByPatientIdAndStatus(UUID patientId, String status);
}
