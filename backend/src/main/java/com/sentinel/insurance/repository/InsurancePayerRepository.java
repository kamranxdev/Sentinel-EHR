package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.InsurancePayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsurancePayerRepository extends JpaRepository<InsurancePayer, UUID> {
    Optional<InsurancePayer> findByPayerCode(String payerCode);
    List<InsurancePayer> findByActiveTrue();
}
