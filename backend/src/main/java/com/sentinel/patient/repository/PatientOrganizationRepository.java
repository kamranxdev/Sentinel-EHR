package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientOrganizationRepository extends JpaRepository<PatientOrganization, UUID> {
    List<PatientOrganization> findByPatientId(UUID patientId);
    Optional<PatientOrganization> findByPatientIdAndOrganizationId(UUID patientId, UUID organizationId);
    Optional<PatientOrganization> findByOrganizationIdAndMrn(UUID organizationId, String mrn);
    boolean existsByOrganizationIdAndMrn(UUID organizationId, String mrn);
    long countByOrganizationId(UUID organizationId);
}
