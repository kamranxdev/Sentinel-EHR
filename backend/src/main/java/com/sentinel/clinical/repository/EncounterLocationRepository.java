package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.EncounterLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EncounterLocationRepository extends JpaRepository<EncounterLocation, UUID> {
    List<EncounterLocation> findByEncounterId(UUID encounterId);

    @Query("SELECT el FROM EncounterLocation el WHERE el.encounter.id = :encounterId AND el.status = 'ACTIVE'")
    Optional<EncounterLocation> findActiveByEncounterId(@Param("encounterId") UUID encounterId);
}
