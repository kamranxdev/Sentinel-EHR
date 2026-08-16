package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.AppointmentReschedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRescheduleRepository extends JpaRepository<AppointmentReschedule, UUID> {
    List<AppointmentReschedule> findByAppointmentIdOrderByRescheduledAtDesc(UUID appointmentId);
}
