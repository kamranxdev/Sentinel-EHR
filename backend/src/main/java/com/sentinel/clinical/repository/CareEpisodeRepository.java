package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.CareEpisode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareEpisodeRepository extends JpaRepository<CareEpisode, UUID> {
    List<CareEpisode> findByPatientId(UUID patientId);
    List<CareEpisode> findByPatientIdOrderByStartedAtDesc(UUID patientId);
    List<CareEpisode> findByPatientIdAndStatus(UUID patientId, String status);
    Optional<CareEpisode> findByEpisodeCode(String episodeCode);
    List<CareEpisode> findByOrganizationId(UUID organizationId);

    @Query("SELECT c FROM CareEpisode c WHERE " +
           "(:patientId IS NULL OR c.patient.id = :patientId) AND " +
           "(:organizationId IS NULL OR c.organization.id = :organizationId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:episodeType IS NULL OR c.episodeType = :episodeType) " +
           "ORDER BY c.startedAt DESC")
    List<CareEpisode> searchCareEpisodes(@Param("patientId") UUID patientId,
                                         @Param("organizationId") UUID organizationId,
                                         @Param("status") String status,
                                         @Param("episodeType") String episodeType);
}
