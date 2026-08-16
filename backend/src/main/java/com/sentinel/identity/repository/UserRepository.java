package com.sentinel.identity.repository;

import com.sentinel.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    List<User> findByRolesName(String roleName);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN UserOrganization uo ON uo.user.id = u.id WHERE uo.organization.id = :organizationId")
    List<User> findByOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN u.person p " +
           "LEFT JOIN u.roles r " +
           "LEFT JOIN UserOrganization uo ON uo.user.id = u.id " +
           "WHERE (:query IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR (p IS NOT NULL AND (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))))) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "AND (:role IS NULL OR r.name = :role) " +
           "AND (:orgId IS NULL OR uo.organization.id = :orgId)")
    List<User> searchUsers(@Param("query") String query,
                           @Param("status") String status,
                           @Param("role") String role,
                           @Param("orgId") UUID orgId);
}
