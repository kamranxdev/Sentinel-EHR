package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientPhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientPhoneNumberRepository extends JpaRepository<PatientPhoneNumber, UUID> {
    List<PatientPhoneNumber> findByPatientId(UUID patientId);
}
