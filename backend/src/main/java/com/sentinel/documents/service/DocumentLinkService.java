package com.sentinel.documents.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.documents.dto.CreateDocumentLinkRequest;
import com.sentinel.documents.dto.DocumentLinkResponseDTO;
import com.sentinel.documents.entity.Document;
import com.sentinel.documents.entity.DocumentLink;
import com.sentinel.documents.repository.DocumentLinkRepository;
import com.sentinel.documents.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentLinkService {

    private final DocumentLinkRepository documentLinkRepository;
    private final DocumentRepository documentRepository;
    private final AuditService auditService;

    public DocumentLinkService(DocumentLinkRepository documentLinkRepository,
                               DocumentRepository documentRepository,
                               AuditService auditService) {
        this.documentLinkRepository = documentLinkRepository;
        this.documentRepository = documentRepository;
        this.auditService = auditService;
    }

    public DocumentLinkResponseDTO createLink(UUID documentId, CreateDocumentLinkRequest request) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        DocumentLink link = new DocumentLink();
        link.setDocument(doc);
        link.setEntityType(request.getEntityType());
        link.setEntityId(request.getEntityId());

        DocumentLink saved = documentLinkRepository.save(link);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "DOCUMENT_LINKED", "Linked document " + documentId + " to " + request.getEntityType() + " " + request.getEntityId());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DocumentLinkResponseDTO> getDocumentLinks(UUID documentId) {
        return documentLinkRepository.findByDocumentId(documentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DocumentLinkResponseDTO mapToDTO(DocumentLink l) {
        DocumentLinkResponseDTO dto = new DocumentLinkResponseDTO();
        dto.setId(l.getId());
        if (l.getDocument() != null) dto.setDocumentId(l.getDocument().getId());
        dto.setEntityType(l.getEntityType());
        dto.setEntityId(l.getEntityId());
        return dto;
    }
}
