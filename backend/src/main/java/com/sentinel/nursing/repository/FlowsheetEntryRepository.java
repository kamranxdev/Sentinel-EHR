package com.sentinel.nursing.repository;

import com.sentinel.nursing.entity.FlowsheetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlowsheetEntryRepository extends JpaRepository<FlowsheetEntry, Long> {
    List<FlowsheetEntry> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    List<FlowsheetEntry> findByEncounterIdOrderByRecordedAtDesc(Long encounterId);
}
