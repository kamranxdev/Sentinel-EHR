package com.sentinel.billing.controller;

import com.sentinel.billing.dto.PaymentResponseDTO;
import com.sentinel.billing.dto.ProcessRefundRequest;
import com.sentinel.billing.dto.RecordPaymentRequest;
import com.sentinel.billing.dto.RefundResponseDTO;
import com.sentinel.billing.service.PaymentService;
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
@Tag(name = "Payments & Refunds", description = "Endpoints for collecting invoice payments and processing patient refunds")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/api/v1/payments")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all payments (optionally filtered by patient)")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getAllPayments(
            @RequestParam(required = false) UUID patientId) {
        List<PaymentResponseDTO> response = (patientId != null)
                ? paymentService.getPatientPayments(patientId)
                : paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/payments")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all payments for a patient")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getPatientPayments(
            @PathVariable UUID patientId) {
        List<PaymentResponseDTO> response = paymentService.getPatientPayments(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/invoices/{invoiceId}/payments")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Record a payment against an invoice")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> recordPayment(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody RecordPaymentRequest request) {
        PaymentResponseDTO response = paymentService.recordPayment(invoiceId, request);
        return new ResponseEntity<>(ApiResponse.success("Payment recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/invoices/{invoiceId}/payments")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get all payments for an invoice")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getInvoicePayments(
            @PathVariable UUID invoiceId) {
        List<PaymentResponseDTO> response = paymentService.getInvoicePayments(invoiceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/payments/{paymentId}")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPayment(
            @PathVariable UUID paymentId) {
        PaymentResponseDTO response = paymentService.getPayment(paymentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/payments/{paymentId}/refund")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Process a refund against a payment")
    public ResponseEntity<ApiResponse<RefundResponseDTO>> processRefund(
            @PathVariable UUID paymentId,
            @Valid @RequestBody ProcessRefundRequest request) {
        RefundResponseDTO response = paymentService.processRefund(paymentId, request);
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", response));
    }
}
