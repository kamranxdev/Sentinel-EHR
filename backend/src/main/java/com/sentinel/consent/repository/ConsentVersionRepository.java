package com.sentinel.consent.repository;

import com.sentinel.consent.entity.ConsentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConsentVersionRepository extends JpaRepository<ConsentVersion, UUID> {
    List<ConsentVersion> findByPatientConsentId(UUID patientConsentId);
}
