package com.sentinel.patient.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.patient.dto.PatientDemographicsResponseDTO;
import com.sentinel.patient.dto.UpdateDemographicsRequest;
import com.sentinel.patient.service.PatientDemographicsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/demographics")
@Tag(name = "Patient Demographics", description = "Endpoints for managing patient demographic details")
public class PatientDemographicsController {

    private final PatientDemographicsService demographicsService;

    public PatientDemographicsController(PatientDemographicsService demographicsService) {
        this.demographicsService = demographicsService;
    }

    @GetMapping
    @Operation(summary = "Get patient demographics")
    public ResponseEntity<ApiResponse<PatientDemographicsResponseDTO>> getDemographics(
            @PathVariable UUID patientId) {
        PatientDemographicsResponseDTO response = demographicsService.getDemographics(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    @Operation(summary = "Update patient demographics")
    public ResponseEntity<ApiResponse<PatientDemographicsResponseDTO>> updateDemographics(
            @PathVariable UUID patientId,
            @Valid @RequestBody UpdateDemographicsRequest request) {
        PatientDemographicsResponseDTO response = demographicsService.updateDemographics(patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Demographics updated successfully", response));
    }
}
