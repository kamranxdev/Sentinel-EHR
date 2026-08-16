package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.ClinicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClinicalDocumentRepository extends JpaRepository<ClinicalDocument, UUID> {
    List<ClinicalDocument> findByEncounterId(UUID encounterId);
    List<ClinicalDocument> findByPatientId(UUID patientId);
}
