package com.sentinel.billing.repository;

import com.sentinel.billing.entity.BillingAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillingAccountRepository extends JpaRepository<BillingAccount, UUID> {
    Optional<BillingAccount> findByPatientIdAndOrganizationId(UUID patientId, UUID organizationId);
    List<BillingAccount> findByPatientId(UUID patientId);
    List<BillingAccount> findByOrganizationId(UUID organizationId);
}
