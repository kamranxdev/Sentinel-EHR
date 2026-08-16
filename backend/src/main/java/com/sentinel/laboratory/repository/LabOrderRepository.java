package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
    List<LabOrder> findByPatientIdOrderByOrderedAtDesc(UUID patientId);
    List<LabOrder> findByEncounterIdOrderByOrderedAtDesc(UUID encounterId);
    List<LabOrder> findByStatusOrderByOrderedAtDesc(String status);
}
