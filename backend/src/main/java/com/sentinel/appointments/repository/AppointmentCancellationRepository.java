package com.sentinel.appointments.repository;

import com.sentinel.appointments.entity.AppointmentCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppointmentCancellationRepository extends JpaRepository<AppointmentCancellation, Long> {
    Optional<AppointmentCancellation> findByAppointmentId(Long appointmentId);
}
