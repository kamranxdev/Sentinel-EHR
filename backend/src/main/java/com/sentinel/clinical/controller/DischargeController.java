package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.DischargePatientRequest;
import com.sentinel.clinical.dto.DischargeResponseDTO;
import com.sentinel.clinical.service.DischargeService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Discharges", description = "Endpoints for inpatient discharges")
public class DischargeController {

    private final DischargeService dischargeService;

    public DischargeController(DischargeService dischargeService) {
        this.dischargeService = dischargeService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/discharge")
    @Operation(summary = "Discharge a patient, finalize encounter, and free bed")
    public ResponseEntity<ApiResponse<DischargeResponseDTO>> dischargePatient(
            @PathVariable UUID encounterId,
            @Valid @RequestBody DischargePatientRequest request) {
        DischargeResponseDTO response = dischargeService.dischargePatient(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Patient discharged successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/discharge")
    @Operation(summary = "Get discharge details for an encounter")
    public ResponseEntity<ApiResponse<DischargeResponseDTO>> getDischarge(
            @PathVariable UUID encounterId) {
        DischargeResponseDTO response = dischargeService.getDischarge(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
