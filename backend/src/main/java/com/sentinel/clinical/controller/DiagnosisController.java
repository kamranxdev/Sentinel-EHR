package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.AddDiagnosisRequest;
import com.sentinel.clinical.dto.DiagnosisResponseDTO;
import com.sentinel.clinical.dto.ResolveDiagnosisRequest;
import com.sentinel.clinical.dto.UpdateDiagnosisRequest;
import com.sentinel.clinical.service.DiagnosisService;
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
@Tag(name = "Diagnoses", description = "Endpoints for encounter diagnoses")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    public DiagnosisController(DiagnosisService diagnosisService) {
        this.diagnosisService = diagnosisService;
    }

    @GetMapping("/api/v1/encounters/{encounterId}/diagnoses")
    @Operation(summary = "Get all diagnoses for an encounter")
    public ResponseEntity<ApiResponse<List<DiagnosisResponseDTO>>> getEncounterDiagnoses(
            @PathVariable UUID encounterId) {
        List<DiagnosisResponseDTO> response = diagnosisService.getEncounterDiagnoses(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/encounters/{encounterId}/diagnoses")
    @Operation(summary = "Add diagnosis to an encounter")
    public ResponseEntity<ApiResponse<DiagnosisResponseDTO>> addDiagnosis(
            @PathVariable UUID encounterId,
            @Valid @RequestBody AddDiagnosisRequest request) {
        DiagnosisResponseDTO response = diagnosisService.addDiagnosis(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Diagnosis added successfully", response), HttpStatus.CREATED);
    }

    @PatchMapping("/api/v1/diagnoses/{diagnosisId}")
    @Operation(summary = "Update diagnosis entry")
    public ResponseEntity<ApiResponse<DiagnosisResponseDTO>> updateDiagnosis(
            @PathVariable UUID diagnosisId,
            @Valid @RequestBody UpdateDiagnosisRequest request) {
        DiagnosisResponseDTO response = diagnosisService.updateDiagnosis(diagnosisId, request);
        return ResponseEntity.ok(ApiResponse.success("Diagnosis updated successfully", response));
    }

    @PostMapping("/api/v1/diagnoses/{diagnosisId}/resolve")
    @Operation(summary = "Resolve diagnosis")
    public ResponseEntity<ApiResponse<DiagnosisResponseDTO>> resolveDiagnosis(
            @PathVariable UUID diagnosisId,
            @RequestBody(required = false) ResolveDiagnosisRequest request) {
        DiagnosisResponseDTO response = diagnosisService.resolveDiagnosis(diagnosisId, request);
        return ResponseEntity.ok(ApiResponse.success("Diagnosis resolved successfully", response));
    }
}
