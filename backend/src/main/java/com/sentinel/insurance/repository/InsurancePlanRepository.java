package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, UUID> {
    List<InsurancePlan> findByPayerId(UUID payerId);
    Optional<InsurancePlan> findByPlanCode(String planCode);
}
