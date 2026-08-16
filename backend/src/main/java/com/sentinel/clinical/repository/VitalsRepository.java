package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.Vitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VitalsRepository extends JpaRepository<Vitals, UUID> {
    List<Vitals> findByEncounterId(UUID encounterId);
    List<Vitals> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    Optional<Vitals> findTopByPatientIdOrderByRecordedAtDesc(UUID patientId);
}
