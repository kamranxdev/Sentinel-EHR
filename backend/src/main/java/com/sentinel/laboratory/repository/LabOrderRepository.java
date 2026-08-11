package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
    List<LabOrder> findByPatientIdOrderByOrderedAtDesc(Long patientId);
    List<LabOrder> findByEncounterIdOrderByOrderedAtDesc(Long encounterId);
    List<LabOrder> findByStatusOrderByOrderedAtDesc(String status);
}
