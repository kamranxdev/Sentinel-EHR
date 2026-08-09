package com.sentinel.prescriptions.repository;

import com.sentinel.prescriptions.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByPrescribedAtDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByPrescribedAtDesc(Long doctorId);
    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);
}
