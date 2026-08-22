package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientEmailAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientEmailAddressRepository extends JpaRepository<PatientEmailAddress, UUID> {
    List<PatientEmailAddress> findByPatientId(UUID patientId);
    List<PatientEmailAddress> findByEmailIgnoreCase(String email);
}
