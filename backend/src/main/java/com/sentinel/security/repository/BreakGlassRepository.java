package com.sentinel.security.repository;

import com.sentinel.security.entity.BreakGlassRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BreakGlassRepository extends JpaRepository<BreakGlassRecord, Long> {
    List<BreakGlassRecord> findByPatientIdOrderByRequestedAtDesc(UUID patientId);
    List<BreakGlassRecord> findByUserUsernameOrderByRequestedAtDesc(String username);
    List<BreakGlassRecord> findByStatusOrderByRequestedAtDesc(String status);
}
