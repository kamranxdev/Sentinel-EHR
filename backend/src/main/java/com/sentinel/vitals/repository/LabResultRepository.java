package com.sentinel.vitals.repository;

import com.sentinel.vitals.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    List<LabResult> findByLabOrderId(Long labOrderId);
    List<LabResult> findByIsCriticalTrue();
}
