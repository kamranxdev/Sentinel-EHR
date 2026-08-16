package com.sentinel.insurance.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.insurance.dto.CreateInsuranceAuthorizationRequest;
import com.sentinel.insurance.dto.InsuranceAuthorizationResponseDTO;
import com.sentinel.insurance.dto.UpdateInsuranceAuthorizationRequest;
import com.sentinel.insurance.service.InsuranceAuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Prior Authorization", description = "Endpoints for pre-authorization with health insurance payers")
public class InsuranceAuthorizationController {

    private final InsuranceAuthorizationService authorizationService;

    public InsuranceAuthorizationController(InsuranceAuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/authorizations")
    @Operation(summary = "Request prior authorization for an encounter")
    public ResponseEntity<ApiResponse<InsuranceAuthorizationResponseDTO>> requestAuthorization(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateInsuranceAuthorizationRequest request) {
        InsuranceAuthorizationResponseDTO response = authorizationService.requestAuthorization(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Prior authorization requested successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/authorizations")
    @Operation(summary = "Get authorizations for an encounter")
    public ResponseEntity<ApiResponse<List<InsuranceAuthorizationResponseDTO>>> getEncounterAuthorizations(
            @PathVariable UUID encounterId) {
        List<InsuranceAuthorizationResponseDTO> response = authorizationService.getEncounterAuthorizations(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/insurance-authorizations/{authId}")
    @Operation(summary = "Get authorization by ID")
    public ResponseEntity<ApiResponse<InsuranceAuthorizationResponseDTO>> getAuthorization(
            @PathVariable UUID authId) {
        InsuranceAuthorizationResponseDTO response = authorizationService.getAuthorization(authId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/insurance-authorizations/{authId}")
    @Operation(summary = "Update authorization approval status/amount")
    public ResponseEntity<ApiResponse<InsuranceAuthorizationResponseDTO>> updateAuthorization(
            @PathVariable UUID authId,
            @Valid @RequestBody UpdateInsuranceAuthorizationRequest request) {
        InsuranceAuthorizationResponseDTO response = authorizationService.updateAuthorization(authId, request);
        return ResponseEntity.ok(ApiResponse.success("Authorization updated successfully", response));
    }
}
