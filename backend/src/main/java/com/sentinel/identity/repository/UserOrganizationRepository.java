package com.sentinel.identity.repository;

import com.sentinel.identity.entity.UserOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserOrganizationRepository extends JpaRepository<UserOrganization, UUID> {
    Optional<UserOrganization> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    List<UserOrganization> findByOrganizationId(UUID organizationId);
    List<UserOrganization> findByUserId(UUID userId);
    boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    void deleteByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}
