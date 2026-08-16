package com.sentinel.documents.repository;

import com.sentinel.documents.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByPatientIdOrderByUploadedAtDesc(UUID patientId);
    List<Document> findByEncounterIdOrderByUploadedAtDesc(UUID encounterId);
}
