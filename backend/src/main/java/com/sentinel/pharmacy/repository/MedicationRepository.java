package com.sentinel.pharmacy.repository;

import com.sentinel.pharmacy.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, UUID> {
    Optional<Medication> findByName(String name);
    Optional<Medication> findByRxNormCode(String rxNormCode);

    @Query("SELECT m FROM Medication m WHERE " +
           "(:query IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:form IS NULL OR m.form = :form)")
    List<Medication> searchMedications(@Param("query") String query, @Param("form") String form);
}
