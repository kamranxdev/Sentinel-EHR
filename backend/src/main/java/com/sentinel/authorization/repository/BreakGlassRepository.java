package com.sentinel.authorization.repository;

import com.sentinel.authorization.entity.BreakGlassRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BreakGlassRepository extends JpaRepository<BreakGlassRecord, Long> {
    
    @Query("SELECT b FROM BreakGlassRecord b WHERE b.patient.id = :patientId AND b.user.username = :username AND b.status = 'ACTIVE' AND b.expiresAt > :now")
    Optional<BreakGlassRecord> findActiveOverride(@Param("patientId") Long patientId, @Param("username") String username, @Param("now") LocalDateTime now);

    List<BreakGlassRecord> findByPatientIdOrderByRequestedAtDesc(Long patientId);
    
    List<BreakGlassRecord> findByUserUsernameOrderByRequestedAtDesc(String username);
}
