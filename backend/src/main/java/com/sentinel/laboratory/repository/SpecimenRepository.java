package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.Specimen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecimenRepository extends JpaRepository<Specimen, UUID> {
    List<Specimen> findByPatientId(UUID patientId);
    Optional<Specimen> findByBarcode(String barcode);
    Optional<Specimen> findByAccessionNumber(String accessionNumber);
}
