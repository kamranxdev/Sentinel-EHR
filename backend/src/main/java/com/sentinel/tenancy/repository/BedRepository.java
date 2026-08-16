package com.sentinel.tenancy.repository;

import com.sentinel.tenancy.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BedRepository extends JpaRepository<Bed, UUID> {
    List<Bed> findByRoomId(UUID roomId);
    List<Bed> findByWardId(UUID wardId);
    List<Bed> findByFacilityId(UUID facilityId);
    List<Bed> findByOrganizationId(UUID organizationId);
    Optional<Bed> findByBedCode(String bedCode);

    @Query("SELECT b FROM Bed b WHERE b.status = 'AVAILABLE' AND " +
           "(:facilityId IS NULL OR b.facility.id = :facilityId) AND " +
           "(:wardId IS NULL OR b.ward.id = :wardId)")
    List<Bed> findAvailableBeds(@Param("facilityId") UUID facilityId, @Param("wardId") UUID wardId);

    @Query("SELECT b FROM Bed b WHERE b.status = 'AVAILABLE' AND " +
           "(:organizationId IS NULL OR b.organization.id = :organizationId) AND " +
           "(:facilityId IS NULL OR b.facility.id = :facilityId) AND " +
           "(:wardId IS NULL OR b.ward.id = :wardId)")
    List<Bed> findAvailableBedsForTenant(@Param("organizationId") UUID organizationId,
                                        @Param("facilityId") UUID facilityId,
                                        @Param("wardId") UUID wardId);
}
