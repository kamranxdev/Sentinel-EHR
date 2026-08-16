package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.CareTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareTeamRepository extends JpaRepository<CareTeam, UUID> {
    List<CareTeam> findByEncounterId(UUID encounterId);
    List<CareTeam> findByPatientId(UUID patientId);
    Optional<CareTeam> findFirstByEncounterId(UUID encounterId);
}
