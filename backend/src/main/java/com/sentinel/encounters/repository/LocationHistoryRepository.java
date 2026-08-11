package com.sentinel.encounters.repository;

import com.sentinel.encounters.entity.LocationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationHistoryRepository extends JpaRepository<LocationHistory, Long> {
    List<LocationHistory> findByEncounterIdOrderByStartTimeDesc(Long encounterId);
    Optional<LocationHistory> findFirstByEncounterIdAndEndTimeIsNull(Long encounterId);
}
