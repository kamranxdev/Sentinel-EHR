package com.sentinel.billing.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.billing.dto.BillingAccountResponseDTO;
import com.sentinel.billing.dto.CreateBillingAccountRequest;
import com.sentinel.billing.entity.BillingAccount;
import com.sentinel.billing.repository.BillingAccountRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillingAccountService {

    private final BillingAccountRepository billingAccountRepository;
    private final PatientRepository patientRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public BillingAccountService(BillingAccountRepository billingAccountRepository,
                                 PatientRepository patientRepository,
                                 OrganizationRepository organizationRepository,
                                 AuditService auditService) {
        this.billingAccountRepository = billingAccountRepository;
        this.patientRepository = patientRepository;
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public BillingAccountResponseDTO createBillingAccount(UUID patientId, CreateBillingAccountRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        BillingAccount account = new BillingAccount();
        account.setPatient(patient);
        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId()).orElse(null);
            account.setOrganization(org);
        } else {
            List<Organization> orgs = organizationRepository.findAll();
            if (!orgs.isEmpty()) account.setOrganization(orgs.get(0));
        }

        account.setAccountNumber(request.getAccountNumber() != null ? request.getAccountNumber() : "ACC-" + System.currentTimeMillis());
        account.setCurrentBalance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO);
        account.setStatus("ACTIVE");
        account.setCreatedAt(OffsetDateTime.now());

        BillingAccount saved = billingAccountRepository.save(account);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "BILLING_ACCOUNT_CREATED", "Created billing account " + saved.getAccountNumber());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BillingAccountResponseDTO> getPatientAccounts(UUID patientId) {
        return billingAccountRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BillingAccountResponseDTO getBillingAccount(UUID accountId) {
        BillingAccount account = billingAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Billing account not found with id: " + accountId));
        return mapToDTO(account);
    }

    public BillingAccountResponseDTO mapToDTO(BillingAccount a) {
        BillingAccountResponseDTO dto = new BillingAccountResponseDTO();
        dto.setId(a.getId());
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getFullName());
        }
        if (a.getOrganization() != null) dto.setOrganizationId(a.getOrganization().getId());
        dto.setAccountNumber(a.getAccountNumber());
        dto.setCurrentBalance(a.getCurrentBalance());
        dto.setStatus(a.getStatus());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
