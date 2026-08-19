package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientMedicalAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientMedicalAlertRepository extends JpaRepository<PatientMedicalAlert, UUID> {
    List<PatientMedicalAlert> findByPatientId(UUID patientId);
    List<PatientMedicalAlert> findByPatientIdAndActiveTrue(UUID patientId);
}
