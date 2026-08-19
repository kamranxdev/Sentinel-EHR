package com.sentinel.billing.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.billing.dto.PaymentResponseDTO;
import com.sentinel.billing.dto.ProcessRefundRequest;
import com.sentinel.billing.dto.RecordPaymentRequest;
import com.sentinel.billing.dto.RefundResponseDTO;
import com.sentinel.billing.entity.Invoice;
import com.sentinel.billing.entity.Payment;
import com.sentinel.billing.entity.PaymentAllocation;
import com.sentinel.billing.entity.Refund;
import com.sentinel.billing.repository.InvoiceRepository;
import com.sentinel.billing.repository.PaymentAllocationRepository;
import com.sentinel.billing.repository.PaymentRepository;
import com.sentinel.billing.repository.RefundRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final InvoiceRepository invoiceRepository;
    private final RefundRepository refundRepository;
    private final AuditService auditService;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentAllocationRepository paymentAllocationRepository,
                          InvoiceRepository invoiceRepository,
                          RefundRepository refundRepository,
                          AuditService auditService) {
        this.paymentRepository = paymentRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
        this.invoiceRepository = invoiceRepository;
        this.refundRepository = refundRepository;
        this.auditService = auditService;
    }

    public PaymentResponseDTO recordPayment(UUID invoiceId, RecordPaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setPatient(invoice.getPatient());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        payment.setTransactionReference(request.getTransactionReference());
        payment.setStatus("COMPLETED");
        payment.setPaidAt(OffsetDateTime.now());

        Payment saved = paymentRepository.save(payment);

        PaymentAllocation allocation = new PaymentAllocation();
        allocation.setPayment(saved);
        allocation.setInvoice(invoice);
        allocation.setAmount(saved.getAmount());
        paymentAllocationRepository.save(allocation);

        BigDecimal newPaidAmount = (invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO).add(saved.getAmount());
        invoice.setPaidAmount(newPaidAmount);
        if (newPaidAmount.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("PARTIALLY_PAID");
        }
        invoiceRepository.save(invoice);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PAYMENT_RECORDED", "Recorded payment of " + saved.getAmount() + " for invoice " + invoiceId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getInvoicePayments(UUID invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public RefundResponseDTO processRefund(UUID paymentId, ProcessRefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setAmount(request.getAmount());
        refund.setReason(request.getReason());
        refund.setStatus("PROCESSED");
        refund.setRequestedAt(OffsetDateTime.now());
        refund.setProcessedAt(OffsetDateTime.now());

        Refund saved = refundRepository.save(refund);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PAYMENT_REFUNDED", "Refunded " + saved.getAmount() + " on payment " + paymentId);
        }

        return mapRefundToDTO(saved);
    }

    public PaymentResponseDTO mapToDTO(Payment p) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(p.getId());
        if (p.getPatient() != null) dto.setPatientId(p.getPatient().getId());
        if (p.getInvoice() != null) dto.setInvoiceId(p.getInvoice().getId());
        dto.setAmount(p.getAmount());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setTransactionReference(p.getTransactionReference());
        dto.setStatus(p.getStatus());
        dto.setPaidAt(p.getPaidAt());
        return dto;
    }

    public RefundResponseDTO mapRefundToDTO(Refund r) {
        RefundResponseDTO dto = new RefundResponseDTO();
        dto.setId(r.getId());
        if (r.getPayment() != null) dto.setPaymentId(r.getPayment().getId());
        dto.setAmount(r.getAmount());
        dto.setReason(r.getReason());
        dto.setStatus(r.getStatus());
        dto.setRequestedAt(r.getRequestedAt());
        dto.setProcessedAt(r.getProcessedAt());
        if (r.getProcessedBy() != null) dto.setProcessedByEmail(r.getProcessedBy().getEmail());
        return dto;
    }
}
