package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientId(UUID patientId);
    List<Appointment> findByPatientIdOrderByStartsAtDesc(UUID patientId);
    List<Appointment> findByOrganizationId(UUID organizationId);
    List<Appointment> findByOrganizationIdOrderByStartsAtDesc(UUID organizationId);
    List<Appointment> findByCreatedByIdOrderByStartsAtDesc(UUID createdById);
    long countByOrganizationId(UUID organizationId);
    long countByOrganizationIdAndStatus(UUID organizationId, String status);

    @Query("SELECT a FROM Appointment a WHERE (a.practitioner.id = :practitionerId OR a.createdBy.id = :practitionerId) AND a.organization.id = :organizationId ORDER BY a.startsAt DESC")
    List<Appointment> findByPractitionerIdAndOrganizationIdOrderByStartsAtDesc(@Param("practitionerId") UUID practitionerId, @Param("organizationId") UUID organizationId);

    @Query("SELECT a FROM Appointment a WHERE (a.practitioner.id = :practitionerId OR a.createdBy.id = :practitionerId) ORDER BY a.startsAt DESC")
    List<Appointment> findByPractitionerIdOrderByStartsAtDesc(@Param("practitionerId") UUID practitionerId);
}
