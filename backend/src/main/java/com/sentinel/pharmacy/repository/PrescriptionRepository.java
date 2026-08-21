package com.sentinel.pharmacy.repository;

import com.sentinel.pharmacy.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByEncounterId(UUID encounterId);
    List<Prescription> findByPatientId(UUID patientId);
    List<Prescription> findByPatientIdAndStatus(UUID patientId, String status);
    List<Prescription> findByPatientIdOrderByPrescribedAtDesc(UUID patientId);
    List<Prescription> findByOrganizationIdOrderByPrescribedAtDesc(UUID organizationId);
    List<Prescription> findByOrganizationIdAndStatusOrderByPrescribedAtDesc(UUID organizationId, String status);
    List<Prescription> findAllByOrderByPrescribedAtDesc();
}
