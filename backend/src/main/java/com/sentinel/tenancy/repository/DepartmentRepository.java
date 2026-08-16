package com.sentinel.tenancy.repository;

import com.sentinel.tenancy.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByFacilityId(UUID facilityId);
    Optional<Department> findByCode(String code);
    List<Department> findByOrganizationId(UUID organizationId);
    Optional<Department> findByFacilityIdAndCode(UUID facilityId, String code);
    boolean existsByFacilityIdAndCode(UUID facilityId, String code);
}
