package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.InsuranceAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InsuranceAuthorizationRepository extends JpaRepository<InsuranceAuthorization, UUID> {
    List<InsuranceAuthorization> findByPatientId(UUID patientId);
    List<InsuranceAuthorization> findByOrganizationId(UUID organizationId);
}
