package com.sentinel.billing.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.billing.dto.AddInvoiceItemRequest;
import com.sentinel.billing.dto.CreateInvoiceRequest;
import com.sentinel.billing.dto.InvoiceResponseDTO;
import com.sentinel.billing.entity.BillingAccount;
import com.sentinel.billing.entity.Invoice;
import com.sentinel.billing.entity.InvoiceItem;
import com.sentinel.billing.repository.BillingAccountRepository;
import com.sentinel.billing.repository.InvoiceItemRepository;
import com.sentinel.billing.repository.InvoiceRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final BillingAccountRepository billingAccountRepository;
    private final AuditService auditService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          InvoiceItemRepository invoiceItemRepository,
                          BillingAccountRepository billingAccountRepository,
                          AuditService auditService) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.billingAccountRepository = billingAccountRepository;
        this.auditService = auditService;
    }

    public InvoiceResponseDTO createInvoice(UUID accountId, CreateInvoiceRequest request) {
        BillingAccount account = billingAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Billing account not found with id: " + accountId));

        Invoice invoice = new Invoice();
        invoice.setPatient(account.getPatient());
        invoice.setInvoiceNumber(request.getInvoiceNumber() != null ? request.getInvoiceNumber() : "INV-" + System.currentTimeMillis());
        invoice.setStatus("DRAFT");
        invoice.setTotalAmount(BigDecimal.ZERO);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setIssuedAt(OffsetDateTime.now());

        Invoice saved = invoiceRepository.save(invoice);

        BigDecimal total = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (AddInvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(saved);
                item.setDescription(itemReq.getDescription());
                item.setAmount(itemReq.getAmount());
                invoiceItemRepository.save(item);
                total = total.add(itemReq.getAmount());
            }
        }
        saved.setTotalAmount(total);
        saved = invoiceRepository.save(saved);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "INVOICE_CREATED", "Created invoice " + saved.getInvoiceNumber() + " with total " + total);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getAccountInvoices(UUID accountId) {
        BillingAccount account = billingAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Billing account not found with id: " + accountId));

        return invoiceRepository.findByPatientIdOrderByIssuedAtDesc(account.getPatient().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoice(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));
        return mapToDTO(invoice);
    }

    public InvoiceResponseDTO addItem(UUID invoiceId, AddInvoiceItemRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setDescription(request.getDescription());
        item.setAmount(request.getAmount());
        invoiceItemRepository.save(item);

        invoice.setTotalAmount(invoice.getTotalAmount().add(request.getAmount()));
        Invoice saved = invoiceRepository.save(invoice);
        return mapToDTO(saved);
    }

    public InvoiceResponseDTO finalizeInvoice(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        invoice.setStatus("ISSUED");
        Invoice saved = invoiceRepository.save(invoice);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "INVOICE_FINALIZED", "Finalized and issued invoice " + saved.getInvoiceNumber());
        }

        return mapToDTO(saved);
    }

    public InvoiceResponseDTO mapToDTO(Invoice inv) {
        InvoiceResponseDTO dto = new InvoiceResponseDTO();
        dto.setId(inv.getId());
        if (inv.getPatient() != null) {
            dto.setPatientId(inv.getPatient().getId());
            dto.setPatientName(inv.getPatient().getFullName());
        }
        dto.setInvoiceNumber(inv.getInvoiceNumber());
        dto.setTotalAmount(inv.getTotalAmount());
        dto.setPaidAmount(inv.getPaidAmount());
        dto.setStatus(inv.getStatus());
        dto.setIssuedAt(inv.getIssuedAt());

        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(inv.getId());
        List<InvoiceResponseDTO.InvoiceItemDTO> itemDTOs = new ArrayList<>();
        for (InvoiceItem item : items) {
            InvoiceResponseDTO.InvoiceItemDTO iDto = new InvoiceResponseDTO.InvoiceItemDTO();
            iDto.setId(item.getId());
            iDto.setDescription(item.getDescription());
            iDto.setAmount(item.getAmount());
            itemDTOs.add(iDto);
        }
        dto.setItems(itemDTOs);

        return dto;
    }
}
