package com.sentinel.pharmacy.repository;

import com.sentinel.pharmacy.entity.MedicationOrderDose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationOrderDoseRepository extends JpaRepository<MedicationOrderDose, UUID> {
    List<MedicationOrderDose> findByMedicationOrderId(UUID medicationOrderId);
}
