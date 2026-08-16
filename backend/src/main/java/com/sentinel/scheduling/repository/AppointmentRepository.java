package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientId(UUID patientId);
    List<Appointment> findByPatientIdOrderByStartsAtDesc(UUID patientId);
    List<Appointment> findByFacilityId(UUID facilityId);
    List<Appointment> findByFacilityIdOrderByStartsAtDesc(UUID facilityId);
    List<Appointment> findByCreatedByIdOrderByStartsAtDesc(UUID createdById);
}
