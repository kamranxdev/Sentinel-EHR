package com.sentinel.billing.controller;

import com.sentinel.billing.entity.Invoice;
import com.sentinel.billing.entity.Payment;
import com.sentinel.billing.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/invoices/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<List<Invoice>> getInvoicesByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(billingService.getInvoicesByPatient(patientId));
    }

    @GetMapping("/payments/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<List<Payment>> getPaymentsByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(billingService.getPaymentsByPatient(patientId));
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        return ResponseEntity.ok(billingService.createInvoice(invoice));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyAuthority('INVOICE_CREATE', 'BILLING_WRITE', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<Payment> recordPayment(@RequestBody Payment payment) {
        return ResponseEntity.ok(billingService.recordPayment(payment));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyAuthority('INVOICE_READ', 'BILLING_READ', 'BILLING_STAFF', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }
}
