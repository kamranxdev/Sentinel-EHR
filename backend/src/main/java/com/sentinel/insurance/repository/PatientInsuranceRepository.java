package com.sentinel.insurance.repository;

import com.sentinel.insurance.entity.PatientInsurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientInsuranceRepository extends JpaRepository<PatientInsurance, UUID> {
    List<PatientInsurance> findByPatientId(UUID patientId);
    List<PatientInsurance> findByPatientIdAndStatus(UUID patientId, String status);
}
