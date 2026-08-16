package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.ClinicalObservationResponseDTO;
import com.sentinel.clinical.dto.RecordObservationRequest;
import com.sentinel.clinical.service.ClinicalObservationService;
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
@Tag(name = "Clinical Observations", description = "Endpoints for general clinical observations and assessments")
public class ClinicalObservationController {

    private final ClinicalObservationService observationService;

    public ClinicalObservationController(ClinicalObservationService observationService) {
        this.observationService = observationService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/observations")
    @Operation(summary = "Record clinical observation for an encounter")
    public ResponseEntity<ApiResponse<ClinicalObservationResponseDTO>> recordObservation(
            @PathVariable UUID encounterId,
            @Valid @RequestBody RecordObservationRequest request) {
        ClinicalObservationResponseDTO response = observationService.recordObservation(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Observation recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/observations")
    @Operation(summary = "Get clinical observations for an encounter")
    public ResponseEntity<ApiResponse<List<ClinicalObservationResponseDTO>>> getEncounterObservations(
            @PathVariable UUID encounterId) {
        List<ClinicalObservationResponseDTO> response = observationService.getEncounterObservations(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/observations")
    @Operation(summary = "Get clinical observations for a patient")
    public ResponseEntity<ApiResponse<List<ClinicalObservationResponseDTO>>> getPatientObservations(
            @PathVariable UUID patientId) {
        List<ClinicalObservationResponseDTO> response = observationService.getPatientObservations(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
