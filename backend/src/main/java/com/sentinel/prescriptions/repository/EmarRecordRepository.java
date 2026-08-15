package com.sentinel.prescriptions.repository;

import com.sentinel.prescriptions.entity.EmarRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmarRecordRepository extends JpaRepository<EmarRecord, Long> {
    List<EmarRecord> findByPatientIdOrderByAdministeredAtDesc(Long patientId);
}
