package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.Discharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DischargeRepository extends JpaRepository<Discharge, UUID> {
    Optional<Discharge> findByEncounterId(UUID encounterId);
}
