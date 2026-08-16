package com.sentinel.procedure.repository;

import com.sentinel.procedure.entity.ProcedurePerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProcedurePerformanceRepository extends JpaRepository<ProcedurePerformance, UUID> {
    List<ProcedurePerformance> findByPatientId(UUID patientId);
    List<ProcedurePerformance> findByProcedureOrderId(Long procedureOrderId);
    List<ProcedurePerformance> findByEncounterId(UUID encounterId);
}
