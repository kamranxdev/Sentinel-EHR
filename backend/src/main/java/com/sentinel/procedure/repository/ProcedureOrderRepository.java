package com.sentinel.procedure.repository;

import com.sentinel.procedure.entity.ProcedureOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProcedureOrderRepository extends JpaRepository<ProcedureOrder, Long> {
    List<ProcedureOrder> findByPatientIdOrderByOrderedAtDesc(UUID patientId);
    List<ProcedureOrder> findByEncounterIdOrderByOrderedAtDesc(UUID encounterId);
    List<ProcedureOrder> findByStatusOrderByOrderedAtDesc(String status);
}
