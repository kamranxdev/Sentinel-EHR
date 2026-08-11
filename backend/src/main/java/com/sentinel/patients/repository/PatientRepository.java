package com.sentinel.patients.repository;

import com.sentinel.patients.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    Optional<Patient> findByUserId(Long userId);
    Optional<Patient> findFirstByUserId(Long userId);
    Optional<Patient> findFirstByEmailIgnoreCase(String email);
    Optional<Patient> findFirstByUser_Username(String username);
    Optional<Patient> findFirstByUser_Email(String email);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.abhaId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.nationalId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Patient> searchPatients(@Param("query") String query);

    @Query("SELECT p FROM Patient p WHERE " +
           "(:name IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:gender IS NULL OR LOWER(p.gender) = LOWER(:gender)) AND " +
           "(:identifier IS NULL OR LOWER(p.patientCode) = LOWER(:identifier) OR LOWER(p.abhaId) = LOWER(:identifier) OR LOWER(p.nationalId) = LOWER(:identifier))")
    List<Patient> searchFhirPatients(@Param("name") String name, @Param("gender") String gender, @Param("identifier") String identifier);
}
