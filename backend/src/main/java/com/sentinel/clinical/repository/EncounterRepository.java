package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, UUID> {
    List<Encounter> findByPatientId(UUID patientId);
    List<Encounter> findByPatientIdOrderByStartedAtDesc(UUID patientId);
    List<Encounter> findByCareEpisodeIdOrderByStartedAtDesc(UUID careEpisodeId);
    Optional<Encounter> findByEncounterNumber(String encounterNumber);
    Optional<Encounter> findByAppointmentId(UUID appointmentId);
    long countByOrganizationIdAndStatus(UUID organizationId, String status);

    @Query("SELECT e FROM Encounter e WHERE " +
           "(:patientId IS NULL OR e.patient.id = :patientId) AND " +
           "(:organizationId IS NULL OR e.organization.id = :organizationId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:encounterType IS NULL OR e.encounterType = :encounterType) " +
           "ORDER BY e.startedAt DESC")
    List<Encounter> searchEncounters(@Param("patientId") UUID patientId,
                                     @Param("organizationId") UUID organizationId,
                                     @Param("status") String status,
                                     @Param("encounterType") String encounterType);
}
