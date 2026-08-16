package com.sentinel.tenancy.repository;

import com.sentinel.tenancy.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, UUID> {
    List<Facility> findByOrganizationId(UUID organizationId);
    Optional<Facility> findByOrganizationIdAndCode(UUID organizationId, String code);
    Optional<Facility> findByCode(String code);
    boolean existsByOrganizationIdAndCode(UUID organizationId, String code);
}
