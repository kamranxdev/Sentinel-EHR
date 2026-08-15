package com.sentinel.allergies.repository;

import com.sentinel.allergies.entity.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    List<Allergy> findByPatientId(Long patientId);
    List<Allergy> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    List<Allergy> findByPatientIdAndStatus(Long patientId, String status);
}
