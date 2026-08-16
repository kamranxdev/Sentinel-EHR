package com.sentinel.documents.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.documents.dto.CreateDocumentLinkRequest;
import com.sentinel.documents.dto.DocumentLinkResponseDTO;
import com.sentinel.documents.service.DocumentLinkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Document Links", description = "Endpoints for linking documents to arbitrary clinical entities")
public class DocumentLinkController {

    private final DocumentLinkService documentLinkService;

    public DocumentLinkController(DocumentLinkService documentLinkService) {
        this.documentLinkService = documentLinkService;
    }

    @PostMapping("/api/v1/documents/{documentId}/links")
    @Operation(summary = "Link document to an entity")
    public ResponseEntity<ApiResponse<DocumentLinkResponseDTO>> createLink(
            @PathVariable UUID documentId,
            @Valid @RequestBody CreateDocumentLinkRequest request) {
        DocumentLinkResponseDTO response = documentLinkService.createLink(documentId, request);
        return new ResponseEntity<>(ApiResponse.success("Document linked successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/documents/{documentId}/links")
    @Operation(summary = "Get all links for a document")
    public ResponseEntity<ApiResponse<List<DocumentLinkResponseDTO>>> getDocumentLinks(
            @PathVariable UUID documentId) {
        List<DocumentLinkResponseDTO> response = documentLinkService.getDocumentLinks(documentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
