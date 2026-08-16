package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.AppointmentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentNoteRepository extends JpaRepository<AppointmentNote, Long> {
    List<AppointmentNote> findByAppointmentIdOrderByCreatedAtDesc(UUID appointmentId);
}
