package com.sentinel.billing.controller;

import com.sentinel.billing.dto.AddInvoiceItemRequest;
import com.sentinel.billing.dto.CreateInvoiceRequest;
import com.sentinel.billing.dto.InvoiceResponseDTO;
import com.sentinel.billing.service.InvoiceService;
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
@Tag(name = "Invoices", description = "Endpoints for generating, retrieving, finalizing, and voiding patient invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/api/v1/invoices")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all invoices (optionally filtered by patient)")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getAllInvoices(
            @RequestParam(required = false) UUID patientId) {
        List<InvoiceResponseDTO> response = (patientId != null)
                ? invoiceService.getPatientInvoices(patientId)
                : invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/invoices")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all invoices for a patient")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getPatientInvoices(
            @PathVariable UUID patientId) {
        List<InvoiceResponseDTO> response = invoiceService.getPatientInvoices(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/billing-accounts/{accountId}/invoices")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Generate an invoice for a billing account")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> createInvoice(
            @PathVariable UUID accountId,
            @Valid @RequestBody CreateInvoiceRequest request) {
        InvoiceResponseDTO response = invoiceService.createInvoice(accountId, request);
        return new ResponseEntity<>(ApiResponse.success("Invoice generated successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/billing-accounts/{accountId}/invoices")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all invoices for a billing account")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getAccountInvoices(
            @PathVariable UUID accountId) {
        List<InvoiceResponseDTO> response = invoiceService.getAccountInvoices(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/invoices/{invoiceId}")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> getInvoice(
            @PathVariable UUID invoiceId) {
        InvoiceResponseDTO response = invoiceService.getInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/invoices/{invoiceId}/items")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Add an item/charge to an invoice")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> addItem(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody AddInvoiceItemRequest request) {
        InvoiceResponseDTO response = invoiceService.addItem(invoiceId, request);
        return new ResponseEntity<>(ApiResponse.success("Item added to invoice successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/api/v1/invoices/{invoiceId}/finalize")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Finalize and issue an invoice")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> finalizeInvoice(
            @PathVariable UUID invoiceId) {
        InvoiceResponseDTO response = invoiceService.finalizeInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success("Invoice finalized and issued successfully", response));
    }

    @PostMapping("/api/v1/invoices/{invoiceId}/void")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Void an invoice")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> voidInvoice(
            @PathVariable UUID invoiceId) {
        InvoiceResponseDTO response = invoiceService.voidInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success("Invoice voided successfully", response));
    }
}
