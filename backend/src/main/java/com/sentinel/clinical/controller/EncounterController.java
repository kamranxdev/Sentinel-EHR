package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.CreateEncounterRequest;
import com.sentinel.clinical.dto.EncounterResponseDTO;
import com.sentinel.clinical.dto.EncounterSearchCriteria;
import com.sentinel.clinical.dto.UpdateEncounterRequest;
import com.sentinel.clinical.service.EncounterService;
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
@Tag(name = "Encounters", description = "Endpoints for clinical encounters")
public class EncounterController {

    private final EncounterService encounterService;

    public EncounterController(EncounterService encounterService) {
        this.encounterService = encounterService;
    }

    @PostMapping("/api/v1/encounters")
    @Operation(summary = "Create a new clinical encounter")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> createEncounter(
            @Valid @RequestBody CreateEncounterRequest request) {
        EncounterResponseDTO response = encounterService.createEncounter(request);
        return new ResponseEntity<>(ApiResponse.success("Encounter created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}")
    @Operation(summary = "Get encounter by ID")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> getEncounter(
            @PathVariable UUID encounterId) {
        EncounterResponseDTO response = encounterService.getEncounter(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/encounters")
    @Operation(summary = "Get all encounters for a patient")
    public ResponseEntity<ApiResponse<List<EncounterResponseDTO>>> getPatientEncounters(
            @PathVariable UUID patientId) {
        List<EncounterResponseDTO> response = encounterService.getPatientEncounters(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/encounters/search")
    @Operation(summary = "Search encounters by criteria")
    public ResponseEntity<ApiResponse<List<EncounterResponseDTO>>> searchEncounters(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) UUID facilityId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String encounterType) {
        EncounterSearchCriteria criteria = new EncounterSearchCriteria(patientId, organizationId, facilityId, status, encounterType);
        List<EncounterResponseDTO> response = encounterService.searchEncounters(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/encounters/{encounterId}")
    @Operation(summary = "Update encounter details")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> updateEncounter(
            @PathVariable UUID encounterId,
            @Valid @RequestBody UpdateEncounterRequest request) {
        EncounterResponseDTO response = encounterService.updateEncounter(encounterId, request);
        return ResponseEntity.ok(ApiResponse.success("Encounter updated successfully", response));
    }

    @PostMapping("/api/v1/encounters/{encounterId}/complete")
    @Operation(summary = "Complete encounter")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> completeEncounter(
            @PathVariable UUID encounterId) {
        EncounterResponseDTO response = encounterService.completeEncounter(encounterId);
        return ResponseEntity.ok(ApiResponse.success("Encounter completed successfully", response));
    }
}
