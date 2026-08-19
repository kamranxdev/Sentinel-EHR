package com.sentinel.documents.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.documents.dto.CreateDocumentRequest;
import com.sentinel.documents.dto.CreateDocumentVersionRequest;
import com.sentinel.documents.dto.DocumentResponseDTO;
import com.sentinel.documents.dto.DocumentVersionResponseDTO;
import com.sentinel.documents.entity.Document;
import com.sentinel.documents.entity.DocumentVersion;
import com.sentinel.documents.repository.DocumentRepository;
import com.sentinel.documents.repository.DocumentVersionRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final OrganizationRepository organizationRepository;
    private final PatientRepository patientRepository;
    private final EncounterRepository encounterRepository;
    private final AuditService auditService;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentVersionRepository documentVersionRepository,
                           OrganizationRepository organizationRepository,
                           PatientRepository patientRepository,
                           EncounterRepository encounterRepository,
                           AuditService auditService) {
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.organizationRepository = organizationRepository;
        this.patientRepository = patientRepository;
        this.encounterRepository = encounterRepository;
        this.auditService = auditService;
    }

    public DocumentResponseDTO createDocument(CreateDocumentRequest request) {
        Document doc = new Document();
        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(doc::setOrganization);
        }
        if (request.getPatientId() != null) {
            patientRepository.findById(request.getPatientId()).ifPresent(doc::setPatient);
        }
        if (request.getEncounterId() != null) {
            encounterRepository.findById(request.getEncounterId()).ifPresent(doc::setEncounter);
        }

        doc.setDocumentType(request.getDocumentType());
        doc.setTitle(request.getTitle());
        doc.setStorageProvider(request.getStorageProvider() != null ? request.getStorageProvider() : "LOCAL");
        doc.setStorageKey(request.getStorageKey());
        doc.setMimeType(request.getMimeType());
        doc.setFileSize(request.getFileSize());
        doc.setStatus("ACTIVE");
        doc.setUploadedAt(OffsetDateTime.now());

        Document saved = documentRepository.save(doc);

        DocumentVersion version = new DocumentVersion();
        version.setDocument(saved);
        version.setVersionNumber(1);
        version.setStorageKey(saved.getStorageKey());
        version.setFileSize(saved.getFileSize());
        version.setCreatedAt(OffsetDateTime.now());
        documentVersionRepository.save(version);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "DOCUMENT_UPLOADED", "Uploaded document: " + saved.getTitle());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public DocumentResponseDTO getDocument(UUID documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
        return mapToDTO(doc);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> getPatientDocuments(UUID patientId) {
        return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DocumentVersionResponseDTO addVersion(UUID documentId, CreateDocumentVersionRequest request) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        List<DocumentVersion> existing = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId);
        int nextVersion = existing.isEmpty() ? 1 : existing.get(0).getVersionNumber() + 1;

        DocumentVersion version = new DocumentVersion();
        version.setDocument(doc);
        version.setVersionNumber(nextVersion);
        version.setStorageKey(request.getStorageKey());
        version.setChecksum(request.getChecksum());
        version.setFileSize(request.getFileSize());
        version.setCreatedAt(OffsetDateTime.now());

        DocumentVersion saved = documentVersionRepository.save(version);

        doc.setStorageKey(request.getStorageKey());
        doc.setFileSize(request.getFileSize());
        documentRepository.save(doc);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "DOCUMENT_VERSION_ADDED", "Added version " + nextVersion + " for document " + documentId);
        }

        return mapVersionToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DocumentVersionResponseDTO> getDocumentVersions(UUID documentId) {
        return documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId).stream()
                .map(this::mapVersionToDTO)
                .collect(Collectors.toList());
    }

    public DocumentResponseDTO mapToDTO(Document d) {
        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(d.getId());
        if (d.getOrganization() != null) dto.setOrganizationId(d.getOrganization().getId());
        if (d.getPatient() != null) dto.setPatientId(d.getPatient().getId());
        if (d.getEncounter() != null) dto.setEncounterId(d.getEncounter().getId());
        dto.setDocumentType(d.getDocumentType());
        dto.setTitle(d.getTitle());
        dto.setStorageProvider(d.getStorageProvider());
        dto.setStorageKey(d.getStorageKey());
        dto.setMimeType(d.getMimeType());
        dto.setFileSize(d.getFileSize());
        dto.setStatus(d.getStatus());
        if (d.getUploadedBy() != null) dto.setUploadedByEmail(d.getUploadedBy().getEmail());
        dto.setUploadedAt(d.getUploadedAt());
        return dto;
    }

    public DocumentVersionResponseDTO mapVersionToDTO(DocumentVersion v) {
        DocumentVersionResponseDTO dto = new DocumentVersionResponseDTO();
        dto.setId(v.getId());
        if (v.getDocument() != null) dto.setDocumentId(v.getDocument().getId());
        dto.setVersionNumber(v.getVersionNumber());
        dto.setStorageKey(v.getStorageKey());
        dto.setChecksum(v.getChecksum());
        dto.setFileSize(v.getFileSize());
        if (v.getCreatedBy() != null) dto.setCreatedByEmail(v.getCreatedBy().getEmail());
        dto.setCreatedAt(v.getCreatedAt());
        return dto;
    }
}
