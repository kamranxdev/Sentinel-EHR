package com.sentinel.pharmacy.repository;

import com.sentinel.pharmacy.entity.MedicationProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationProductRepository extends JpaRepository<MedicationProduct, UUID> {
    List<MedicationProduct> findByMedicationId(UUID medicationId);
    Optional<MedicationProduct> findByProductCode(String productCode);
}
