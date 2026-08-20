package com.sentinel.insurance.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.insurance.dto.CreateInsuranceClaimRequest;
import com.sentinel.insurance.dto.InsuranceClaimResponseDTO;
import com.sentinel.insurance.dto.UpdateInsuranceClaimRequest;
import com.sentinel.insurance.service.InsuranceClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Insurance Claims", description = "Endpoints for generating, updating, and submitting claims to insurers")
public class InsuranceClaimController {

    private final InsuranceClaimService claimService;

    public InsuranceClaimController(InsuranceClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/claims")
    @Operation(summary = "Create an insurance claim for an encounter")
    public ResponseEntity<ApiResponse<InsuranceClaimResponseDTO>> createClaim(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateInsuranceClaimRequest request) {
        InsuranceClaimResponseDTO response = claimService.createClaim(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Insurance claim created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/claims")
    @Operation(summary = "Get claims for an encounter")
    public ResponseEntity<ApiResponse<List<InsuranceClaimResponseDTO>>> getEncounterClaims(
            @PathVariable UUID encounterId) {
        List<InsuranceClaimResponseDTO> response = claimService.getEncounterClaims(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/insurance-claims/{claimId}")
    @Operation(summary = "Get insurance claim by ID")
    public ResponseEntity<ApiResponse<InsuranceClaimResponseDTO>> getClaim(
            @PathVariable UUID claimId) {
        InsuranceClaimResponseDTO response = claimService.getClaim(claimId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/insurance-claims/{claimId}")
    @Operation(summary = "Update insurance claim")
    public ResponseEntity<ApiResponse<InsuranceClaimResponseDTO>> updateClaim(
            @PathVariable UUID claimId,
            @Valid @RequestBody UpdateInsuranceClaimRequest request) {
        InsuranceClaimResponseDTO response = claimService.updateClaim(claimId, request);
        return ResponseEntity.ok(ApiResponse.success("Insurance claim updated successfully", response));
    }

    @PostMapping("/api/v1/insurance-claims/{claimId}/submit")
    @Operation(summary = "Submit an insurance claim")
    public ResponseEntity<ApiResponse<InsuranceClaimResponseDTO>> submitClaim(
            @PathVariable UUID claimId) {
        InsuranceClaimResponseDTO response = claimService.submitClaim(claimId);
        return ResponseEntity.ok(ApiResponse.success("Insurance claim submitted successfully", response));
    }

    @GetMapping("/api/v1/insurance-claims")
    @Operation(summary = "Get all insurance claims")
    public ResponseEntity<ApiResponse<List<InsuranceClaimResponseDTO>>> getAllClaims() {
        List<InsuranceClaimResponseDTO> response = claimService.getAllClaims();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
