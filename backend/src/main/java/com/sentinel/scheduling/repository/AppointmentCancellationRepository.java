package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.AppointmentCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentCancellationRepository extends JpaRepository<AppointmentCancellation, Long> {
    Optional<AppointmentCancellation> findByAppointmentId(UUID appointmentId);
}
