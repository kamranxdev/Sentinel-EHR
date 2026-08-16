package com.sentinel.documents.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.documents.dto.CreateDocumentRequest;
import com.sentinel.documents.dto.CreateDocumentVersionRequest;
import com.sentinel.documents.dto.DocumentResponseDTO;
import com.sentinel.documents.dto.DocumentVersionResponseDTO;
import com.sentinel.documents.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Document Management", description = "Endpoints for EMR file attachments, scanned docs, and versioning")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/api/v1/documents")
    @Operation(summary = "Upload/register a new document")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> createDocument(
            @Valid @RequestBody CreateDocumentRequest request) {
        DocumentResponseDTO response = documentService.createDocument(request);
        return new ResponseEntity<>(ApiResponse.success("Document uploaded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/documents/{documentId}")
    @Operation(summary = "Get document by ID")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> getDocument(
            @PathVariable UUID documentId) {
        DocumentResponseDTO response = documentService.getDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/documents")
    @Operation(summary = "Get all documents for a patient")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getPatientDocuments(
            @PathVariable UUID patientId) {
        List<DocumentResponseDTO> response = documentService.getPatientDocuments(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/documents/{documentId}/versions")
    @Operation(summary = "Add a new version to a document")
    public ResponseEntity<ApiResponse<DocumentVersionResponseDTO>> addVersion(
            @PathVariable UUID documentId,
            @Valid @RequestBody CreateDocumentVersionRequest request) {
        DocumentVersionResponseDTO response = documentService.addVersion(documentId, request);
        return new ResponseEntity<>(ApiResponse.success("Document version added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/documents/{documentId}/versions")
    @Operation(summary = "Get all versions of a document")
    public ResponseEntity<ApiResponse<List<DocumentVersionResponseDTO>>> getDocumentVersions(
            @PathVariable UUID documentId) {
        List<DocumentVersionResponseDTO> response = documentService.getDocumentVersions(documentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
