package com.sentinel.patient.repository;

import com.sentinel.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByPersonId(UUID personId);
    boolean existsByPersonId(UUID personId);

    @Query("SELECT DISTINCT p FROM Patient p " +
           "LEFT JOIN p.person per " +
           "LEFT JOIN PatientOrganization po ON po.patient.id = p.id " +
           "LEFT JOIN PatientPhoneNumber ph ON ph.patient.id = p.id " +
           "LEFT JOIN PatientEmailAddress e ON e.patient.id = p.id " +
           "WHERE (:query IS NULL OR LOWER(per.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(per.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(CONCAT(per.firstName, ' ', per.lastName)) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(po.mrn) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:mrn IS NULL OR po.mrn = :mrn) " +
           "AND (:phone IS NULL OR ph.phoneNumber LIKE CONCAT('%', :phone, '%')) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:orgId IS NULL OR po.organization.id = :orgId)")
    List<Patient> searchPatients(@Param("query") String query,
                                @Param("mrn") String mrn,
                                @Param("phone") String phone,
                                @Param("status") String status,
                                @Param("orgId") UUID orgId);

    @Query("SELECT DISTINCT p FROM Patient p " +
           "LEFT JOIN p.person per " +
           "LEFT JOIN PatientOrganization po ON po.patient.id = p.id " +
           "LEFT JOIN PatientPhoneNumber ph ON ph.patient.id = p.id " +
           "WHERE (:name IS NULL OR LOWER(per.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(per.lastName) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:identifier IS NULL OR po.mrn = :identifier) " +
           "AND (:phone IS NULL OR ph.phoneNumber LIKE CONCAT('%', :phone, '%'))")
    List<Patient> searchFhirPatients(@Param("name") String name,
                                     @Param("identifier") String identifier,
                                     @Param("phone") String phone);
}
