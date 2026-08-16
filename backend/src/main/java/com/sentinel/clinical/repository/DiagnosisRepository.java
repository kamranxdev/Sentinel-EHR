package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {
    List<Diagnosis> findByPatientId(UUID patientId);
    List<Diagnosis> findByPatientIdOrderByRecordedAtDesc(UUID patientId);

    @Query("SELECT d FROM Diagnosis d WHERE d.patient.id = :patientId AND d.status = 'active'")
    List<Diagnosis> findActiveByPatientId(@Param("patientId") UUID patientId);
}
