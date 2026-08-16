package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.NursingFlowsheetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NursingFlowsheetEntryRepository extends JpaRepository<NursingFlowsheetEntry, UUID> {
    List<NursingFlowsheetEntry> findByFlowsheetId(UUID flowsheetId);
}
