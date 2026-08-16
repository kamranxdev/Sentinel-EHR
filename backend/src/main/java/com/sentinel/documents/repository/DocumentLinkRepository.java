package com.sentinel.documents.repository;

import com.sentinel.documents.entity.DocumentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentLinkRepository extends JpaRepository<DocumentLink, UUID> {
    List<DocumentLink> findByDocumentId(UUID documentId);
    List<DocumentLink> findByEntityTypeAndEntityId(String entityType, UUID entityId);
}
