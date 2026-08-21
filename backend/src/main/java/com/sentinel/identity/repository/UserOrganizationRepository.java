package com.sentinel.identity.repository;

import com.sentinel.identity.entity.UserOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserOrganizationRepository extends JpaRepository<UserOrganization, UUID> {
    Optional<UserOrganization> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    List<UserOrganization> findByOrganizationId(UUID organizationId);
    List<UserOrganization> findByUserId(UUID userId);
    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    boolean existsByUserIdAndOrganizationIdAndStatus(UUID userId, UUID organizationId, String status);
    Optional<UserOrganization> findFirstByUserIdAndStatusOrderByJoinedAtAsc(UUID userId, String status);
    long countByOrganizationIdAndStatus(UUID organizationId, String status);

    @Query("SELECT COUNT(DISTINCT uo.user.id) FROM UserOrganization uo JOIN uo.user u JOIN u.roles r " +
           "WHERE uo.organization.id = :organizationId AND uo.status = 'ACTIVE' AND u.status = 'ACTIVE' " +
           "AND r.name IN ('PHYSICIAN', 'DOCTOR')")
    long countActivePractitionersByOrganizationId(@Param("organizationId") UUID organizationId);
    void deleteByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}
