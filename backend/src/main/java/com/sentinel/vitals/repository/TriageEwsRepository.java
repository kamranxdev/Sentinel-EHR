package com.sentinel.vitals.repository;

import com.sentinel.vitals.entity.TriageEwsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TriageEwsRepository extends JpaRepository<TriageEwsRecord, Long> {
    List<TriageEwsRecord> findByPatientIdOrderByRecordedAtDesc(Long patientId);
}
