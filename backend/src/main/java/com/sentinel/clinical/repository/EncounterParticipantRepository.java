package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.EncounterParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EncounterParticipantRepository extends JpaRepository<EncounterParticipant, UUID> {
    List<EncounterParticipant> findByEncounterId(UUID encounterId);
    List<EncounterParticipant> findByPractitionerId(UUID practitionerId);
    List<EncounterParticipant> findByEncounterIdAndPeriodEndIsNull(UUID encounterId);
}
