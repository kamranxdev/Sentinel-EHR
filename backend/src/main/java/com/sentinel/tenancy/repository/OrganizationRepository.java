package com.sentinel.tenancy.repository;

import com.sentinel.tenancy.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByName(String name);

    @Query("SELECT o FROM Organization o WHERE " +
           "(:query IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(o.code) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:orgType IS NULL OR o.organizationType = :orgType)")
    List<Organization> searchOrganizations(@Param("query") String query,
                                          @Param("status") String status,
                                          @Param("orgType") String orgType);
}
