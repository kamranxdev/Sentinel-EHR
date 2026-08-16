package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.ClinicalDocumentResponseDTO;
import com.sentinel.clinical.dto.CreateClinicalDocumentRequest;
import com.sentinel.clinical.dto.CreateDocumentVersionRequest;
import com.sentinel.clinical.service.ClinicalDocumentService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Clinical Documents", description = "Endpoints for clinical documents, consultation notes, and version history")
public class ClinicalDocumentController {

    private final ClinicalDocumentService documentService;

    public ClinicalDocumentController(ClinicalDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/documents")
    @Operation(summary = "Create clinical document for an encounter")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponseDTO>> createDocument(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateClinicalDocumentRequest request) {
        ClinicalDocumentResponseDTO response = documentService.createDocument(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Document created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/documents")
    @Operation(summary = "Get all clinical documents for an encounter")
    public ResponseEntity<ApiResponse<List<ClinicalDocumentResponseDTO>>> getEncounterDocuments(
            @PathVariable UUID encounterId) {
        List<ClinicalDocumentResponseDTO> response = documentService.getEncounterDocuments(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/clinical-documents/{documentId}")
    @Operation(summary = "Get clinical document by ID with all versions")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponseDTO>> getDocument(
            @PathVariable UUID documentId) {
        ClinicalDocumentResponseDTO response = documentService.getDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/clinical-documents/{documentId}/versions")
    @Operation(summary = "Add a new version/amendment to a clinical document")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponseDTO>> createDocumentVersion(
            @PathVariable UUID documentId,
            @Valid @RequestBody CreateDocumentVersionRequest request) {
        ClinicalDocumentResponseDTO response = documentService.createDocumentVersion(documentId, request);
        return new ResponseEntity<>(ApiResponse.success("Document version created successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/api/v1/clinical-documents/{documentId}/finalize")
    @Operation(summary = "Finalize a clinical document")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponseDTO>> finalizeDocument(
            @PathVariable UUID documentId) {
        ClinicalDocumentResponseDTO response = documentService.finalizeDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success("Document finalized successfully", response));
    }
}
