package com.sentinel.procedure.repository;

import com.sentinel.procedure.entity.ProcedureNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProcedureNoteRepository extends JpaRepository<ProcedureNote, UUID> {
    List<ProcedureNote> findByPerformanceIdOrderByCreatedAtDesc(UUID performanceId);
}
