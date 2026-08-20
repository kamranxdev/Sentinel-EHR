package com.sentinel.billing.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.billing.entity.ChargeItem;
import com.sentinel.billing.repository.ChargeItemRepository;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.insurance.dto.InsuranceClaimResponseDTO;
import com.sentinel.insurance.entity.InsuranceClaim;
import com.sentinel.insurance.entity.InsuranceClaimItem;
import com.sentinel.insurance.entity.InsurancePayer;
import com.sentinel.insurance.repository.InsuranceClaimItemRepository;
import com.sentinel.insurance.repository.InsuranceClaimRepository;
import com.sentinel.insurance.repository.InsurancePayerRepository;
import com.sentinel.insurance.service.InsuranceClaimService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Bridges clinical encounter charge items into the insurance claims clearinghouse.
 */
@Service
@Transactional
public class BillingEventService {

    private final EncounterRepository encounterRepository;
    private final ChargeItemRepository chargeItemRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final InsuranceClaimItemRepository insuranceClaimItemRepository;
    private final InsurancePayerRepository payerRepository;
    private final InsuranceClaimService insuranceClaimService;
    private final AuditService auditService;

    public BillingEventService(EncounterRepository encounterRepository,
                               ChargeItemRepository chargeItemRepository,
                               InsuranceClaimRepository insuranceClaimRepository,
                               InsuranceClaimItemRepository insuranceClaimItemRepository,
                               InsurancePayerRepository payerRepository,
                               InsuranceClaimService insuranceClaimService,
                               AuditService auditService) {
        this.encounterRepository = encounterRepository;
        this.chargeItemRepository = chargeItemRepository;
        this.insuranceClaimRepository = insuranceClaimRepository;
        this.insuranceClaimItemRepository = insuranceClaimItemRepository;
        this.payerRepository = payerRepository;
        this.insuranceClaimService = insuranceClaimService;
        this.auditService = auditService;
    }

    public InsuranceClaimResponseDTO generateClaimForEncounter(UUID encounterId, UUID payerId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found: " + encounterId));

        InsurancePayer payer = null;
        if (payerId != null) {
            payer = payerRepository.findById(payerId).orElse(null);
        }
        if (payer == null) {
            payer = payerRepository.findAll().stream().findFirst().orElse(null);
        }

        List<ChargeItem> chargeItems = chargeItemRepository.findByEncounterId(encounterId);
        BigDecimal totalBilled = chargeItems.stream()
                .map(ChargeItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        InsuranceClaim claim = new InsuranceClaim();
        claim.setOrganization(encounter.getOrganization());
        claim.setPatient(encounter.getPatient());
        claim.setPayer(payer);
        claim.setClaimNumber("CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        claim.setTotalAmount(totalBilled);
        claim.setStatus("DRAFT");

        InsuranceClaim savedClaim = insuranceClaimRepository.save(claim);

        for (ChargeItem ci : chargeItems) {
            InsuranceClaimItem item = new InsuranceClaimItem();
            item.setClaim(savedClaim);
            item.setChargeItemId(ci.getId());
            item.setServiceCode(ci.getCode());
            item.setDescription(ci.getDescription() != null ? ci.getDescription() : ci.getCode());
            item.setQuantity(BigDecimal.ONE);
            item.setBilledAmount(ci.getAmount());
            insuranceClaimItemRepository.save(item);

            ci.setStatus("CLAIMED");
            chargeItemRepository.save(ci);
        }

        if (auditService != null) {
            auditService.logEvent(savedClaim.getId(), "CLAIM_GENERATED_FROM_ENCOUNTER",
                    "Claim " + savedClaim.getClaimNumber() + " generated for encounter " + encounterId);
        }

        return insuranceClaimService.mapToDTO(savedClaim);
    }
}
