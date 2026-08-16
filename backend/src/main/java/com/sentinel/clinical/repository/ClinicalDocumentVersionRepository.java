package com.sentinel.clinical.repository;

import com.sentinel.clinical.entity.ClinicalDocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClinicalDocumentVersionRepository extends JpaRepository<ClinicalDocumentVersion, UUID> {
    List<ClinicalDocumentVersion> findByDocumentIdOrderByVersionNumberAsc(UUID documentId);
}
