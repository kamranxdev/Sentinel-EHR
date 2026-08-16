package com.sentinel.terminology.repository;

import com.sentinel.terminology.entity.TerminologyUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TerminologyUnitRepository extends JpaRepository<TerminologyUnit, UUID> {
    Optional<TerminologyUnit> findByCode(String code);
}
