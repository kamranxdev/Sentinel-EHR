package com.sentinel.billing.service;

import com.sentinel.billing.entity.BillingAccount;
import com.sentinel.billing.entity.Invoice;
import com.sentinel.billing.entity.Payment;
import com.sentinel.billing.repository.BillingAccountRepository;
import com.sentinel.billing.repository.InvoiceRepository;
import com.sentinel.billing.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    private final BillingAccountRepository billingAccountRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public BillingService(BillingAccountRepository billingAccountRepository,
                          InvoiceRepository invoiceRepository,
                          PaymentRepository paymentRepository) {
        this.billingAccountRepository = billingAccountRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByPatient(UUID patientId) {
        return invoiceRepository.findByPatientIdOrderByIssuedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByPatient(UUID patientId) {
        return paymentRepository.findByPatientIdOrderByPaidAtDesc(patientId);
    }

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Payment recordPayment(Payment payment) {
        return paymentRepository.save(payment);
    }
}
