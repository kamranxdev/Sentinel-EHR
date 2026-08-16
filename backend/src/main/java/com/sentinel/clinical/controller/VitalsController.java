package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.RecordVitalsRequest;
import com.sentinel.clinical.dto.VitalsResponseDTO;
import com.sentinel.clinical.service.VitalService;
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
@Tag(name = "Vitals", description = "Endpoints for recording and querying patient vital signs")
public class VitalsController {

    private final VitalService vitalService;

    public VitalsController(VitalService vitalService) {
        this.vitalService = vitalService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/vitals")
    @Operation(summary = "Record vitals for an encounter")
    public ResponseEntity<ApiResponse<VitalsResponseDTO>> recordVitals(
            @PathVariable UUID encounterId,
            @Valid @RequestBody RecordVitalsRequest request) {
        VitalsResponseDTO response = vitalService.recordVitals(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Vitals recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/vitals")
    @Operation(summary = "Get all vitals recorded during an encounter")
    public ResponseEntity<ApiResponse<List<VitalsResponseDTO>>> getEncounterVitals(
            @PathVariable UUID encounterId) {
        List<VitalsResponseDTO> response = vitalService.getEncounterVitals(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/vitals")
    @Operation(summary = "Get all vitals recorded for a patient")
    public ResponseEntity<ApiResponse<List<VitalsResponseDTO>>> getPatientVitals(
            @PathVariable UUID patientId) {
        List<VitalsResponseDTO> response = vitalService.getPatientVitals(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/vitals/latest")
    @Operation(summary = "Get the latest vitals recorded for a patient")
    public ResponseEntity<ApiResponse<VitalsResponseDTO>> getLatestVitals(
            @PathVariable UUID patientId) {
        VitalsResponseDTO response = vitalService.getLatestVitals(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
