package com.sentinel.vitals.repository;

import com.sentinel.vitals.entity.Vitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VitalsRepository extends JpaRepository<Vitals, Long> {
    List<Vitals> findByPatientId(Long patientId);
    List<Vitals> findByPatientIdOrderByRecordedAtDesc(Long patientId);
}
