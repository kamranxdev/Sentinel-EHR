package com.sentinel.patient.repository;

import com.sentinel.patient.entity.PatientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientContactRepository extends JpaRepository<PatientContact, UUID> {
    List<PatientContact> findByPatientId(UUID patientId);
}
