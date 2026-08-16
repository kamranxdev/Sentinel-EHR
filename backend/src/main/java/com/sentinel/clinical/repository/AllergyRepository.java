package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, UUID> {
    List<Allergy> findByPatientId(UUID patientId);
    List<Allergy> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    List<Allergy> findByPatientIdAndStatus(UUID patientId, String status);
}
