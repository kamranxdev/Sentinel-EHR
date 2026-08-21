package com.sentinel.insurance.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.common.exception.AccessDeniedCustomException;
import com.sentinel.insurance.dto.CreateInsuranceClaimRequest;
import com.sentinel.insurance.dto.InsuranceClaimResponseDTO;
import com.sentinel.insurance.dto.UpdateInsuranceClaimRequest;
import com.sentinel.insurance.entity.InsuranceClaim;
import com.sentinel.insurance.entity.InsuranceClaimItem;
import com.sentinel.insurance.entity.InsurancePayer;
import com.sentinel.insurance.repository.InsuranceClaimItemRepository;
import com.sentinel.insurance.repository.InsuranceClaimRepository;
import com.sentinel.insurance.repository.InsurancePayerRepository;
import com.sentinel.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InsuranceClaimService {

    private final InsuranceClaimRepository claimRepository;
    private final InsuranceClaimItemRepository itemRepository;
    private final EncounterRepository encounterRepository;
    private final InsurancePayerRepository payerRepository;
    private final AuditService auditService;

    public InsuranceClaimService(InsuranceClaimRepository claimRepository,
                                 InsuranceClaimItemRepository itemRepository,
                                 EncounterRepository encounterRepository,
                                 InsurancePayerRepository payerRepository,
                                 AuditService auditService) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
        this.encounterRepository = encounterRepository;
        this.payerRepository = payerRepository;
        this.auditService = auditService;
    }

    public InsuranceClaimResponseDTO createClaim(UUID encounterId, CreateInsuranceClaimRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        requireTenantAccess(encounter.getOrganization().getId());

        InsurancePayer payer = payerRepository.findById(request.getPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer not found with id: " + request.getPayerId()));

        InsuranceClaim claim = new InsuranceClaim();
        claim.setPatient(encounter.getPatient());
        claim.setOrganization(encounter.getOrganization());
        claim.setPayer(payer);
        claim.setClaimNumber(request.getClaimNumber() != null ? request.getClaimNumber() : "CLM-" + System.currentTimeMillis());
        claim.setStatus("DRAFT");
        claim.setTotalAmount(request.getTotalAmount());

        InsuranceClaim savedClaim = claimRepository.save(claim);

        if (request.getItems() != null) {
            for (CreateInsuranceClaimRequest.ClaimItemRequest itemReq : request.getItems()) {
                InsuranceClaimItem item = new InsuranceClaimItem();
                item.setClaim(savedClaim);
                item.setChargeItemId(itemReq.getChargeItemId());
                item.setServiceCode(itemReq.getServiceCode());
                item.setDescription(itemReq.getDescription());
                item.setQuantity(itemReq.getQuantity());
                item.setBilledAmount(itemReq.getBilledAmount());
                itemRepository.save(item);
            }
        }

        if (auditService != null) {
            auditService.logEvent(savedClaim.getId(), "INSURANCE_CLAIM_CREATED", "Created claim " + savedClaim.getClaimNumber());
        }

        return mapToDTO(savedClaim);
    }

    @Transactional(readOnly = true)
    public List<InsuranceClaimResponseDTO> getEncounterClaims(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        requireTenantAccess(encounter.getOrganization().getId());

        return claimRepository.findByPatientId(encounter.getPatient().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InsuranceClaimResponseDTO getClaim(UUID claimId) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance claim not found with id: " + claimId));
        requireTenantAccess(claim.getOrganization().getId());
        return mapToDTO(claim);
    }

    public InsuranceClaimResponseDTO updateClaim(UUID claimId, UpdateInsuranceClaimRequest request) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance claim not found with id: " + claimId));
        requireTenantAccess(claim.getOrganization().getId());

        if (request.getStatus() != null) claim.setStatus(request.getStatus());
        if (request.getApprovedAmount() != null) claim.setApprovedAmount(request.getApprovedAmount());
        if (request.getRejectedAmount() != null) claim.setRejectedAmount(request.getRejectedAmount());
        if (request.getResponse() != null) claim.setResponse(request.getResponse());

        InsuranceClaim saved = claimRepository.save(claim);
        return mapToDTO(saved);
    }

    public InsuranceClaimResponseDTO submitClaim(UUID claimId) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance claim not found with id: " + claimId));
        requireTenantAccess(claim.getOrganization().getId());

        claim.setStatus("SUBMITTED");
        claim.setSubmittedAt(OffsetDateTime.now());

        InsuranceClaim saved = claimRepository.save(claim);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "INSURANCE_CLAIM_SUBMITTED", "Submitted claim " + saved.getClaimNumber());
        }

        return mapToDTO(saved);
    }

    public InsuranceClaimResponseDTO mapToDTO(InsuranceClaim c) {
        InsuranceClaimResponseDTO dto = new InsuranceClaimResponseDTO();
        dto.setId(c.getId());
        if (c.getPatient() != null) {
            dto.setPatientId(c.getPatient().getId());
            dto.setPatientName(c.getPatient().getFullName());
        }
        if (c.getOrganization() != null) dto.setOrganizationId(c.getOrganization().getId());
        if (c.getPayer() != null) {
            dto.setPayerId(c.getPayer().getId());
            dto.setPayerName(c.getPayer().getName());
        }
        dto.setClaimNumber(c.getClaimNumber());
        dto.setStatus(c.getStatus());
        dto.setTotalAmount(c.getTotalAmount());
        dto.setApprovedAmount(c.getApprovedAmount());
        dto.setRejectedAmount(c.getRejectedAmount());
        dto.setSubmittedAt(c.getSubmittedAt());

        List<InsuranceClaimItem> items = itemRepository.findByClaimId(c.getId());
        List<InsuranceClaimResponseDTO.ClaimItemDTO> itemDTOs = new ArrayList<>();
        for (InsuranceClaimItem item : items) {
            InsuranceClaimResponseDTO.ClaimItemDTO itemDTO = new InsuranceClaimResponseDTO.ClaimItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setChargeItemId(item.getChargeItemId());
            itemDTO.setServiceCode(item.getServiceCode());
            itemDTO.setDescription(item.getDescription());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setBilledAmount(item.getBilledAmount());
            itemDTO.setApprovedAmount(item.getApprovedAmount());
            itemDTO.setRejectedAmount(item.getRejectedAmount());
            itemDTOs.add(itemDTO);
        }
        dto.setItems(itemDTOs);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<InsuranceClaimResponseDTO> getAllClaims() {
        UUID organizationId = TenantContext.getCurrentOrganizationId();
        if (organizationId == null) {
            throw new AccessDeniedCustomException("An organization context is required to access insurance claims.");
        }
        return claimRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void requireTenantAccess(UUID resourceOrganizationId) {
        UUID organizationId = TenantContext.getCurrentOrganizationId();
        if (organizationId == null || !organizationId.equals(resourceOrganizationId)) {
            throw new AccessDeniedCustomException("The requested insurance claim does not belong to the active organization.");
        }
    }
}
