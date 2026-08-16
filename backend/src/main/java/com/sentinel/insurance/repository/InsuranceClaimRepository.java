package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.InsuranceClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, UUID> {
    List<InsuranceClaim> findByPatientId(UUID patientId);
    List<InsuranceClaim> findByOrganizationId(UUID organizationId);
}
