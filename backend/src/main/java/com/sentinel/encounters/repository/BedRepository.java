package com.sentinel.encounters.repository;

import com.sentinel.encounters.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    Optional<Bed> findByBedCode(String bedCode);
    List<Bed> findByDepartmentName(String departmentName);
    List<Bed> findByWardName(String wardName);
    List<Bed> findByStatus(String status);
    List<Bed> findByDepartmentNameAndStatus(String departmentName, String status);
}
