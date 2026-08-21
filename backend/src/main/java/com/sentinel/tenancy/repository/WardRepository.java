package com.sentinel.tenancy.repository;

import com.sentinel.tenancy.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WardRepository extends JpaRepository<Ward, UUID> {
    List<Ward> findByDepartmentId(UUID departmentId);
    Optional<Ward> findByCode(String code);
    List<Ward> findByOrganizationId(UUID organizationId);
    long countByOrganizationIdAndStatus(UUID organizationId, String status);
}
