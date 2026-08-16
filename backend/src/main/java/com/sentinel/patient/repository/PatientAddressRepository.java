package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientAddressRepository extends JpaRepository<PatientAddress, UUID> {
    List<PatientAddress> findByPatientId(UUID patientId);
}
