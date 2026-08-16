package com.sentinel.terminology.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.terminology.dto.CodeSystemResponseDTO;
import com.sentinel.terminology.dto.CreateCodeSystemRequest;
import com.sentinel.terminology.dto.CreateTerminologyCodeRequest;
import com.sentinel.terminology.dto.TerminologyCodeResponseDTO;
import com.sentinel.terminology.service.TerminologyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Terminology", description = "Endpoints for standard clinical coding systems and terminologies (LOINC, SNOMED CT, ICD-10)")
public class TerminologyController {

    private final TerminologyService terminologyService;

    public TerminologyController(TerminologyService terminologyService) {
        this.terminologyService = terminologyService;
    }

    @PostMapping("/api/v1/code-systems")
    @Operation(summary = "Register a new code system")
    public ResponseEntity<ApiResponse<CodeSystemResponseDTO>> createCodeSystem(
            @Valid @RequestBody CreateCodeSystemRequest request) {
        CodeSystemResponseDTO response = terminologyService.createCodeSystem(request);
        return new ResponseEntity<>(ApiResponse.success("Code system registered successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/code-systems")
    @Operation(summary = "Get all registered code systems")
    public ResponseEntity<ApiResponse<List<CodeSystemResponseDTO>>> getAllCodeSystems() {
        List<CodeSystemResponseDTO> response = terminologyService.getAllCodeSystems();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/code-systems/{systemId}/codes")
    @Operation(summary = "Add a code to a code system")
    public ResponseEntity<ApiResponse<TerminologyCodeResponseDTO>> createCode(
            @PathVariable UUID systemId,
            @Valid @RequestBody CreateTerminologyCodeRequest request) {
        TerminologyCodeResponseDTO response = terminologyService.createCode(systemId, request);
        return new ResponseEntity<>(ApiResponse.success("Code added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/code-systems/{systemId}/codes")
    @Operation(summary = "Get all codes for a specific system")
    public ResponseEntity<ApiResponse<List<TerminologyCodeResponseDTO>>> getCodesBySystem(
            @PathVariable UUID systemId) {
        List<TerminologyCodeResponseDTO> response = terminologyService.getCodesBySystem(systemId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/terminology/search")
    @Operation(summary = "Search for a concept code across code systems")
    public ResponseEntity<ApiResponse<List<TerminologyCodeResponseDTO>>> searchCodes(
            @RequestParam String query) {
        List<TerminologyCodeResponseDTO> response = terminologyService.searchCodes(query);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
