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

    @PostMapping("/api/v1/invoices/{invoiceId}/payments")
    @Operation(summary = "Record a payment against an invoice")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> recordPayment(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody RecordPaymentRequest request) {
        PaymentResponseDTO response = paymentService.recordPayment(invoiceId, request);
        return new ResponseEntity<>(ApiResponse.success("Payment recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/invoices/{invoiceId}/payments")
    @Operation(summary = "Get all payments for an invoice")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getInvoicePayments(
            @PathVariable UUID invoiceId) {
        List<PaymentResponseDTO> response = paymentService.getInvoicePayments(invoiceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/payments/{paymentId}/refund")
    @Operation(summary = "Process a refund against a payment")
    public ResponseEntity<ApiResponse<RefundResponseDTO>> processRefund(
            @PathVariable UUID paymentId,
            @Valid @RequestBody ProcessRefundRequest request) {
        RefundResponseDTO response = paymentService.processRefund(paymentId, request);
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", response));
    }
}
