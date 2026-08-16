package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.TriageEwsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TriageEwsRecordRepository extends JpaRepository<TriageEwsRecord, UUID> {
    List<TriageEwsRecord> findByPatientId(UUID patientId);
    Optional<TriageEwsRecord> findTopByPatientIdOrderByRecordedAtDesc(UUID patientId);
}
