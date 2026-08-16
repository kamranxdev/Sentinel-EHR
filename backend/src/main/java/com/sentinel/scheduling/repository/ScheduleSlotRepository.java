package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.ScheduleSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, UUID> {
    List<ScheduleSlot> findByPractitionerId(UUID practitionerId);
    List<ScheduleSlot> findByPractitionerIdAndStartTimeBetween(UUID practitionerId, OffsetDateTime start, OffsetDateTime end);
}
