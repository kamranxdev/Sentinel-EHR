package com.sentinel.insurance.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.insurance.dto.CreatePatientInsuranceRequest;
import com.sentinel.insurance.dto.PatientInsuranceResponseDTO;
import com.sentinel.insurance.dto.UpdatePatientInsuranceRequest;
import com.sentinel.insurance.service.PatientInsuranceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Patient Insurance", description = "Endpoints for managing patient insurance coverage and policies")
public class PatientInsuranceController {

    private final PatientInsuranceService patientInsuranceService;

    public PatientInsuranceController(PatientInsuranceService patientInsuranceService) {
        this.patientInsuranceService = patientInsuranceService;
    }

    @PostMapping("/api/v1/patients/{patientId}/insurances")
    @Operation(summary = "Add an insurance policy for a patient")
    public ResponseEntity<ApiResponse<PatientInsuranceResponseDTO>> addPolicy(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreatePatientInsuranceRequest request) {
        PatientInsuranceResponseDTO response = patientInsuranceService.addPolicy(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Insurance policy added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/insurances")
    @Operation(summary = "Get all insurance policies for a patient")
    public ResponseEntity<ApiResponse<List<PatientInsuranceResponseDTO>>> getPatientPolicies(
            @PathVariable UUID patientId) {
        List<PatientInsuranceResponseDTO> response = patientInsuranceService.getPatientPolicies(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patient-insurances/{policyId}")
    @Operation(summary = "Get patient insurance policy by ID")
    public ResponseEntity<ApiResponse<PatientInsuranceResponseDTO>> getPolicy(
            @PathVariable UUID policyId) {
        PatientInsuranceResponseDTO response = patientInsuranceService.getPolicy(policyId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/patient-insurances/{policyId}")
    @Operation(summary = "Update patient insurance policy")
    public ResponseEntity<ApiResponse<PatientInsuranceResponseDTO>> updatePolicy(
            @PathVariable UUID policyId,
            @Valid @RequestBody UpdatePatientInsuranceRequest request) {
        PatientInsuranceResponseDTO response = patientInsuranceService.updatePolicy(policyId, request);
        return ResponseEntity.ok(ApiResponse.success("Insurance policy updated successfully", response));
    }
}
