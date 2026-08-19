package com.sentinel.identity.repository;

import com.sentinel.identity.entity.Practitioner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PractitionerRepository extends JpaRepository<Practitioner, UUID> {
    Optional<Practitioner> findByIdentifier(String identifier);
    Optional<Practitioner> findByPersonId(UUID personId);

    @Query("SELECT pr FROM Practitioner pr " +
           "JOIN User u ON u.person.id = pr.person.id " +
           "JOIN UserOrganization uo ON uo.user.id = u.id " +
           "WHERE uo.organization.id = :organizationId")
    List<Practitioner> findByOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("SELECT DISTINCT pr FROM Practitioner pr " +
           "JOIN pr.person p " +
           "LEFT JOIN User u ON u.person.id = p.id " +
           "LEFT JOIN UserOrganization uo ON uo.user.id = u.id " +
           "WHERE (:query IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(pr.identifier) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:specialty IS NULL OR LOWER(pr.primarySpecialty) LIKE LOWER(CONCAT('%', :specialty, '%'))) " +
           "AND (:status IS NULL OR pr.status = :status) " +
           "AND (:orgId IS NULL OR uo.organization.id = :orgId)")
    List<Practitioner> search(@Param("query") String query,
                              @Param("specialty") String specialty,
                              @Param("status") String status,
                              @Param("orgId") UUID orgId);
}
