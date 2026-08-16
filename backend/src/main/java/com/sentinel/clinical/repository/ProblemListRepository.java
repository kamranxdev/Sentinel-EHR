package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.ProblemList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProblemListRepository extends JpaRepository<ProblemList, UUID> {
    List<ProblemList> findByPatientId(UUID patientId);

    @Query("SELECT p FROM ProblemList p WHERE p.patient.id = :patientId AND p.status = 'ACTIVE'")
    List<ProblemList> findActiveByPatientId(@Param("patientId") UUID patientId);
}
