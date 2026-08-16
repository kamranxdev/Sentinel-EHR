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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Invoices", description = "Endpoints for generating and finalizing patient invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/api/v1/billing-accounts/{accountId}/invoices")
    @Operation(summary = "Generate an invoice for a billing account")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> createInvoice(
            @PathVariable UUID accountId,
            @Valid @RequestBody CreateInvoiceRequest request) {
        InvoiceResponseDTO response = invoiceService.createInvoice(accountId, request);
        return new ResponseEntity<>(ApiResponse.success("Invoice generated successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/billing-accounts/{accountId}/invoices")
    @Operation(summary = "Get all invoices for a billing account")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getAccountInvoices(
            @PathVariable UUID accountId) {
        List<InvoiceResponseDTO> response = invoiceService.getAccountInvoices(accountId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/invoices/{invoiceId}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> getInvoice(
            @PathVariable UUID invoiceId) {
        InvoiceResponseDTO response = invoiceService.getInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/invoices/{invoiceId}/items")
    @Operation(summary = "Add an item/charge to an invoice")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> addItem(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody AddInvoiceItemRequest request) {
        InvoiceResponseDTO response = invoiceService.addItem(invoiceId, request);
        return new ResponseEntity<>(ApiResponse.success("Item added to invoice successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/api/v1/invoices/{invoiceId}/finalize")
    @Operation(summary = "Finalize and issue an invoice")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> finalizeInvoice(
            @PathVariable UUID invoiceId) {
        InvoiceResponseDTO response = invoiceService.finalizeInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success("Invoice finalized and issued successfully", response));
    }
}
