package com.sentinel.pharmacy.repository;

import com.sentinel.pharmacy.entity.MedicationAdministration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, UUID> {
    List<MedicationAdministration> findByPatientId(UUID patientId);
    List<MedicationAdministration> findByPrescriptionId(UUID prescriptionId);
    List<MedicationAdministration> findByPatientIdOrderByAdministeredAtDesc(UUID patientId);
}
