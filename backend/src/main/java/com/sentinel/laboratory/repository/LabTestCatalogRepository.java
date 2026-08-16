package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.LabTestCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LabTestCatalogRepository extends JpaRepository<LabTestCatalog, UUID> {
    Optional<LabTestCatalog> findByTestCode(String testCode);
    Optional<LabTestCatalog> findByLoincCode(String loincCode);
}
