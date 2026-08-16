package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, UUID> {
    Optional<Admission> findByEncounterId(UUID encounterId);
}
