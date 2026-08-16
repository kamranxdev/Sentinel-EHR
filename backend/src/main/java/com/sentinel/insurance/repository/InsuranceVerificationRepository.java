package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.InsuranceVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InsuranceVerificationRepository extends JpaRepository<InsuranceVerification, UUID> {
    List<InsuranceVerification> findByPatientInsuranceId(UUID patientInsuranceId);
}
