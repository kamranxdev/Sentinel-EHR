package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.ClinicalDocumentResponseDTO;
import com.sentinel.clinical.dto.CreateClinicalDocumentRequest;
import com.sentinel.clinical.dto.CreateDocumentVersionRequest;
import com.sentinel.clinical.entity.ClinicalDocument;
import com.sentinel.clinical.entity.ClinicalDocumentVersion;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.ClinicalDocumentRepository;
import com.sentinel.clinical.repository.ClinicalDocumentVersionRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClinicalDocumentService {

    private final ClinicalDocumentRepository documentRepository;
    private final ClinicalDocumentVersionRepository versionRepository;
    private final EncounterRepository encounterRepository;
    private final AuditService auditService;

    public ClinicalDocumentService(ClinicalDocumentRepository documentRepository,
                                  ClinicalDocumentVersionRepository versionRepository,
                                  EncounterRepository encounterRepository,
                                  AuditService auditService) {
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
        this.encounterRepository = encounterRepository;
        this.auditService = auditService;
    }

    public ClinicalDocumentResponseDTO createDocument(UUID encounterId, CreateClinicalDocumentRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        ClinicalDocument doc = new ClinicalDocument();
        doc.setOrganization(encounter.getOrganization());
        doc.setPatient(encounter.getPatient());
        doc.setEncounter(encounter);
        doc.setDocumentType(request.getDocumentType() != null ? request.getDocumentType() : "PROGRESS_NOTE");
        doc.setTitle(request.getTitle());
        doc.setStatus("DRAFT");
        doc.setAuthoredAt(OffsetDateTime.now());
        doc.setCreatedAt(OffsetDateTime.now());

        ClinicalDocument savedDoc = documentRepository.save(doc);

        if (request.getContent() != null) {
            ClinicalDocumentVersion version = new ClinicalDocumentVersion();
            version.setDocument(savedDoc);
            version.setVersionNumber(1);
            version.setContent(request.getContent());
            version.setAuthoredAt(OffsetDateTime.now());
            versionRepository.save(version);
        }

        if (auditService != null) {
            auditService.logEvent(savedDoc.getId(), "CLINICAL_DOCUMENT_CREATED", "Created document: " + savedDoc.getTitle());
        }

        return mapToDTO(savedDoc);
    }

    @Transactional(readOnly = true)
    public List<ClinicalDocumentResponseDTO> getEncounterDocuments(UUID encounterId) {
        return documentRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClinicalDocumentResponseDTO getDocument(UUID documentId) {
        ClinicalDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical document not found with id: " + documentId));
        return mapToDTO(doc);
    }

    public ClinicalDocumentResponseDTO createDocumentVersion(UUID documentId, CreateDocumentVersionRequest request) {
        ClinicalDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical document not found with id: " + documentId));

        List<ClinicalDocumentVersion> existingVersions = versionRepository.findByDocumentIdOrderByVersionNumberAsc(documentId);
        int nextVersion = existingVersions.size() + 1;

        ClinicalDocumentVersion version = new ClinicalDocumentVersion();
        version.setDocument(doc);
        version.setVersionNumber(nextVersion);
        version.setContent(request.getContent());
        version.setAmendmentReason(request.getAmendmentReason());
        version.setAuthoredAt(OffsetDateTime.now());
        versionRepository.save(version);

        if (auditService != null) {
            auditService.logEvent(doc.getId(), "CLINICAL_DOCUMENT_AMENDED", "Document version " + nextVersion + " created");
        }

        return mapToDTO(doc);
    }

    public ClinicalDocumentResponseDTO finalizeDocument(UUID documentId) {
        ClinicalDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical document not found with id: " + documentId));

        doc.setStatus("FINAL");
        ClinicalDocument saved = documentRepository.save(doc);

        if (auditService != null) {
            auditService.logEvent(doc.getId(), "CLINICAL_DOCUMENT_FINALIZED", "Document finalized: " + doc.getTitle());
        }

        return mapToDTO(saved);
    }

    public ClinicalDocumentResponseDTO mapToDTO(ClinicalDocument d) {
        ClinicalDocumentResponseDTO dto = new ClinicalDocumentResponseDTO();
        dto.setId(d.getId());
        if (d.getPatient() != null) dto.setPatientId(d.getPatient().getId());
        if (d.getEncounter() != null) dto.setEncounterId(d.getEncounter().getId());
        dto.setDocumentType(d.getDocumentType());
        dto.setTitle(d.getTitle());
        dto.setStatus(d.getStatus());
        if (d.getAuthorUser() != null) dto.setAuthorUsername(d.getAuthorUser().getUsername());
        dto.setAuthoredAt(d.getAuthoredAt());
        dto.setCreatedAt(d.getCreatedAt());

        List<ClinicalDocumentVersion> versions = versionRepository.findByDocumentIdOrderByVersionNumberAsc(d.getId());
        dto.setVersions(versions.stream()
                .map(v -> new ClinicalDocumentResponseDTO.VersionDTO(
                        v.getId(),
                        v.getVersionNumber(),
                        v.getContent(),
                        v.getAuthoredBy() != null ? v.getAuthoredBy().getUsername() : null,
                        v.getAmendmentReason(),
                        v.getAuthoredAt()
                ))
                .collect(Collectors.toList()));

        return dto;
    }
}
