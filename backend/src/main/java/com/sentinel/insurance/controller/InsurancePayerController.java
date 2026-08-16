package com.sentinel.insurance.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.insurance.dto.CreateInsurancePayerRequest;
import com.sentinel.insurance.dto.CreateInsurancePlanRequest;
import com.sentinel.insurance.dto.InsurancePayerResponseDTO;
import com.sentinel.insurance.dto.InsurancePlanResponseDTO;
import com.sentinel.insurance.service.InsurancePayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Insurance Payers & Plans", description = "Endpoints for managing insurance companies and benefit plans")
public class InsurancePayerController {

    private final InsurancePayerService payerService;

    public InsurancePayerController(InsurancePayerService payerService) {
        this.payerService = payerService;
    }

    @PostMapping("/api/v1/insurance-payers")
    @Operation(summary = "Create an insurance payer")
    public ResponseEntity<ApiResponse<InsurancePayerResponseDTO>> createPayer(
            @Valid @RequestBody CreateInsurancePayerRequest request) {
        InsurancePayerResponseDTO response = payerService.createPayer(request);
        return new ResponseEntity<>(ApiResponse.success("Insurance payer created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/insurance-payers")
    @Operation(summary = "Get all active insurance payers")
    public ResponseEntity<ApiResponse<List<InsurancePayerResponseDTO>>> getAllPayers() {
        List<InsurancePayerResponseDTO> response = payerService.getAllPayers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/insurance-payers/{payerId}")
    @Operation(summary = "Get insurance payer by ID")
    public ResponseEntity<ApiResponse<InsurancePayerResponseDTO>> getPayer(
            @PathVariable UUID payerId) {
        InsurancePayerResponseDTO response = payerService.getPayer(payerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/insurance-payers/{payerId}/plans")
    @Operation(summary = "Create an insurance plan under a payer")
    public ResponseEntity<ApiResponse<InsurancePlanResponseDTO>> createPlan(
            @PathVariable UUID payerId,
            @Valid @RequestBody CreateInsurancePlanRequest request) {
        InsurancePlanResponseDTO response = payerService.createPlan(payerId, request);
        return new ResponseEntity<>(ApiResponse.success("Insurance plan created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/insurance-payers/{payerId}/plans")
    @Operation(summary = "Get all plans under a payer")
    public ResponseEntity<ApiResponse<List<InsurancePlanResponseDTO>>> getPayerPlans(
            @PathVariable UUID payerId) {
        List<InsurancePlanResponseDTO> response = payerService.getPayerPlans(payerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
