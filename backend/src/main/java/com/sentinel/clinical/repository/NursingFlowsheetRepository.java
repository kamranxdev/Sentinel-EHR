package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.NursingFlowsheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NursingFlowsheetRepository extends JpaRepository<NursingFlowsheet, UUID> {
    List<NursingFlowsheet> findByEncounterId(UUID encounterId);
    List<NursingFlowsheet> findByPatientIdOrderByRecordedAtDesc(UUID patientId);
    List<NursingFlowsheet> findByEncounterIdOrderByRecordedAtDesc(UUID encounterId);
}
