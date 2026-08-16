package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.InsuranceClaimItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InsuranceClaimItemRepository extends JpaRepository<InsuranceClaimItem, UUID> {
    List<InsuranceClaimItem> findByClaimId(UUID claimId);
}
