package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, UUID> {
    List<LabResult> findByLabOrderId(Long labOrderId);
    List<LabResult> findByPatientId(UUID patientId);
    List<LabResult> findByPatientIdOrderByResultAtDesc(UUID patientId);
    List<LabResult> findByIsCriticalTrue();
}
