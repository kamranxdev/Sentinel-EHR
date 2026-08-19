package com.sentinel.pharmacy.repository;

import com.sentinel.pharmacy.entity.MedicationReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationReconciliationRepository extends JpaRepository<MedicationReconciliation, UUID> {
    List<MedicationReconciliation> findByPatientId(UUID patientId);
    List<MedicationReconciliation> findByEncounterId(UUID encounterId);
}
