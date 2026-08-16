package com.sentinel.identity.repository;

import com.sentinel.identity.entity.PractitionerLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PractitionerLicenseRepository extends JpaRepository<PractitionerLicense, UUID> {
    List<PractitionerLicense> findByPractitionerId(UUID practitionerId);
}
