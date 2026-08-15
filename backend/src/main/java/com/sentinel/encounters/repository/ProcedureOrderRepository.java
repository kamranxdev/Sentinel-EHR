package com.sentinel.encounters.repository;

import com.sentinel.encounters.entity.ProcedureOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureOrderRepository extends JpaRepository<ProcedureOrder, Long> {
    List<ProcedureOrder> findByPatientIdOrderByOrderedAtDesc(Long patientId);
    List<ProcedureOrder> findByEncounterIdOrderByOrderedAtDesc(Long encounterId);
    List<ProcedureOrder> findByStatusOrderByOrderedAtDesc(String status);
}
