package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.AppointmentParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentParticipantRepository extends JpaRepository<AppointmentParticipant, UUID> {
    List<AppointmentParticipant> findByAppointmentId(UUID appointmentId);
}
