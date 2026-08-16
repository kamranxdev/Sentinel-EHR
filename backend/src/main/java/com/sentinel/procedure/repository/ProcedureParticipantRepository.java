package com.sentinel.procedure.repository;

import com.sentinel.procedure.entity.ProcedureParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProcedureParticipantRepository extends JpaRepository<ProcedureParticipant, UUID> {
    List<ProcedureParticipant> findByPerformanceId(UUID performanceId);
}
