package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.TriageRequestDTO;
import com.sentinel.clinical.dto.TriageResponseDTO;
import com.sentinel.clinical.service.TriageService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Triage", description = "Endpoints for emergency / triage records")
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/triage")
    @Operation(summary = "Record triage info for an encounter")
    public ResponseEntity<ApiResponse<TriageResponseDTO>> recordTriage(
            @PathVariable UUID encounterId,
            @Valid @RequestBody TriageRequestDTO request) {
        TriageResponseDTO response = triageService.recordTriage(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Triage recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/triage")
    @Operation(summary = "Get triage record for an encounter")
    public ResponseEntity<ApiResponse<TriageResponseDTO>> getTriage(
            @PathVariable UUID encounterId) {
        TriageResponseDTO response = triageService.getTriage(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/api/v1/encounters/{encounterId}/triage")
    @Operation(summary = "Update triage record for an encounter")
    public ResponseEntity<ApiResponse<TriageResponseDTO>> updateTriage(
            @PathVariable UUID encounterId,
            @Valid @RequestBody TriageRequestDTO request) {
        TriageResponseDTO response = triageService.updateTriage(encounterId, request);
        return ResponseEntity.ok(ApiResponse.success("Triage updated successfully", response));
    }
}
