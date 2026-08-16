package com.sentinel.laboratory.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.laboratory.dto.LabResultResponseDTO;
import com.sentinel.laboratory.dto.RecordLabResultRequest;
import com.sentinel.laboratory.service.LabResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Laboratory Results", description = "Endpoints for recording and verifying lab results")
public class LabResultController {

    private final LabResultService labResultService;

    public LabResultController(LabResultService labResultService) {
        this.labResultService = labResultService;
    }

    @PostMapping("/api/v1/lab-orders/{orderId}/results")
    @Operation(summary = "Record lab result for an order")
    public ResponseEntity<ApiResponse<LabResultResponseDTO>> recordLabResult(
            @PathVariable Long orderId,
            @Valid @RequestBody RecordLabResultRequest request) {
        LabResultResponseDTO response = labResultService.recordLabResult(orderId, request);
        return new ResponseEntity<>(ApiResponse.success("Lab result recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/lab-orders/{orderId}/results")
    @Operation(summary = "Get results for a lab order")
    public ResponseEntity<ApiResponse<List<LabResultResponseDTO>>> getOrderResults(
            @PathVariable Long orderId) {
        List<LabResultResponseDTO> response = labResultService.getOrderResults(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/lab-results")
    @Operation(summary = "Get all lab results for a patient")
    public ResponseEntity<ApiResponse<List<LabResultResponseDTO>>> getPatientResults(
            @PathVariable UUID patientId) {
        List<LabResultResponseDTO> response = labResultService.getPatientResults(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/lab-results/{resultId}/verify")
    @Operation(summary = "Verify a lab result")
    public ResponseEntity<ApiResponse<LabResultResponseDTO>> verifyResult(
            @PathVariable UUID resultId) {
        LabResultResponseDTO response = labResultService.verifyResult(resultId);
        return ResponseEntity.ok(ApiResponse.success("Lab result verified successfully", response));
    }
}
