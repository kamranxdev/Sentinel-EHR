package com.sentinel.billing.controller;

import com.sentinel.billing.dto.BillingAccountResponseDTO;
import com.sentinel.billing.dto.CreateBillingAccountRequest;
import com.sentinel.billing.service.BillingAccountService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Billing Accounts", description = "Endpoints for managing patient billing and financial ledger accounts")
public class BillingAccountController {

    private final BillingAccountService billingAccountService;

    public BillingAccountController(BillingAccountService billingAccountService) {
        this.billingAccountService = billingAccountService;
    }

    @GetMapping("/api/v1/billing-accounts")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all billing accounts (optionally filtered by patient)")
    public ResponseEntity<ApiResponse<List<BillingAccountResponseDTO>>> getAllBillingAccounts(
            @RequestParam(required = false) UUID patientId) {
        List<BillingAccountResponseDTO> response = (patientId != null)
                ? billingAccountService.getPatientAccounts(patientId)
                : billingAccountService.getAllAccounts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patients/{patientId}/billing-accounts")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Create a billing account for a patient")
    public ResponseEntity<ApiResponse<BillingAccountResponseDTO>> createBillingAccount(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateBillingAccountRequest request) {
        BillingAccountResponseDTO response = billingAccountService.createBillingAccount(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Billing account created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/billing-accounts")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get billing accounts for a patient")
    public ResponseEntity<ApiResponse<List<BillingAccountResponseDTO>>> getPatientAccounts(
            @PathVariable UUID patientId) {
        List<BillingAccountResponseDTO> response = billingAccountService.getPatientAccounts(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/billing-accounts/{accountId}")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get billing account by ID")
    public ResponseEntity<ApiResponse<BillingAccountResponseDTO>> getBillingAccount(
            @PathVariable UUID accountId) {
        BillingAccountResponseDTO response = billingAccountService.getBillingAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
