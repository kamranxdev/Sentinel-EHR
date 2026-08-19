package com.sentinel.identity.repository;

import com.sentinel.identity.entity.UserDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDepartmentRepository extends JpaRepository<UserDepartment, UUID> {
    List<UserDepartment> findByUserId(UUID userId);
    List<UserDepartment> findByDepartmentId(UUID departmentId);
    Optional<UserDepartment> findByUserIdAndDepartmentId(UUID userId, UUID departmentId);
}
