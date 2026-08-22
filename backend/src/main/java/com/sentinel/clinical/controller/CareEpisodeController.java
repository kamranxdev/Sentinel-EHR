package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.*;
import com.sentinel.clinical.service.CareEpisodeService;
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
@Tag(name = "Care Episodes", description = "Endpoints for managing overarching patient Care Episodes across Outpatient, Emergency, and Inpatient workflows")
public class CareEpisodeController {

    private final CareEpisodeService careEpisodeService;

    public CareEpisodeController(CareEpisodeService careEpisodeService) {
        this.careEpisodeService = careEpisodeService;
    }

    @PostMapping("/api/v1/care-episodes")
    @Operation(summary = "Create a new Care Episode")
    public ResponseEntity<ApiResponse<CareEpisodeResponseDTO>> createCareEpisode(
            @Valid @RequestBody CreateCareEpisodeRequest request) {
        CareEpisodeResponseDTO response = careEpisodeService.createCareEpisode(request);
        return new ResponseEntity<>(ApiResponse.success("Care Episode created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/care-episodes/{episodeId}")
    @Operation(summary = "Get Care Episode by ID")
    public ResponseEntity<ApiResponse<CareEpisodeResponseDTO>> getCareEpisode(
            @PathVariable UUID episodeId) {
        CareEpisodeResponseDTO response = careEpisodeService.getCareEpisode(episodeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/care-episodes")
    @Operation(summary = "Get all Care Episodes for a patient")
    public ResponseEntity<ApiResponse<List<CareEpisodeResponseDTO>>> getPatientCareEpisodes(
            @PathVariable UUID patientId) {
        List<CareEpisodeResponseDTO> response = careEpisodeService.getPatientCareEpisodes(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/care-episodes/search")
    @Operation(summary = "Search Care Episodes by criteria")
    public ResponseEntity<ApiResponse<List<CareEpisodeResponseDTO>>> searchCareEpisodes(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String episodeType) {
        List<CareEpisodeResponseDTO> response = careEpisodeService.searchCareEpisodes(patientId, organizationId, status, episodeType);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/care-episodes/{episodeId}")
    @Operation(summary = "Update Care Episode details")
    public ResponseEntity<ApiResponse<CareEpisodeResponseDTO>> updateCareEpisode(
            @PathVariable UUID episodeId,
            @Valid @RequestBody UpdateCareEpisodeRequest request) {
        CareEpisodeResponseDTO response = careEpisodeService.updateCareEpisode(episodeId, request);
        return ResponseEntity.ok(ApiResponse.success("Care Episode updated successfully", response));
    }

    @PostMapping("/api/v1/care-episodes/{episodeId}/close")
    @Operation(summary = "Close a Care Episode")
    public ResponseEntity<ApiResponse<CareEpisodeResponseDTO>> closeCareEpisode(
            @PathVariable UUID episodeId,
            @RequestBody(required = false) CloseCareEpisodeRequest request) {
        CareEpisodeResponseDTO response = careEpisodeService.closeCareEpisode(episodeId, request);
        return ResponseEntity.ok(ApiResponse.success("Care Episode closed successfully", response));
    }

    @GetMapping("/api/v1/care-episodes/{episodeId}/encounters")
    @Operation(summary = "Get all Encounters linked to a Care Episode")
    public ResponseEntity<ApiResponse<List<EncounterResponseDTO>>> getCareEpisodeEncounters(
            @PathVariable UUID episodeId) {
        List<EncounterResponseDTO> response = careEpisodeService.getCareEpisodeEncounters(episodeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
