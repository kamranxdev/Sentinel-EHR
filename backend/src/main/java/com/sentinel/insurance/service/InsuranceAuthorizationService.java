package com.sentinel.insurance.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.insurance.dto.CreateInsuranceAuthorizationRequest;
import com.sentinel.insurance.dto.InsuranceAuthorizationResponseDTO;
import com.sentinel.insurance.dto.UpdateInsuranceAuthorizationRequest;
import com.sentinel.insurance.entity.InsuranceAuthorization;
import com.sentinel.insurance.entity.InsurancePayer;
import com.sentinel.insurance.repository.InsuranceAuthorizationRepository;
import com.sentinel.insurance.repository.InsurancePayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InsuranceAuthorizationService {

    private final InsuranceAuthorizationRepository authorizationRepository;
    private final EncounterRepository encounterRepository;
    private final InsurancePayerRepository payerRepository;
    private final AuditService auditService;

    public InsuranceAuthorizationService(InsuranceAuthorizationRepository authorizationRepository,
                                         EncounterRepository encounterRepository,
                                         InsurancePayerRepository payerRepository,
                                         AuditService auditService) {
        this.authorizationRepository = authorizationRepository;
        this.encounterRepository = encounterRepository;
        this.payerRepository = payerRepository;
        this.auditService = auditService;
    }

    public InsuranceAuthorizationResponseDTO requestAuthorization(UUID encounterId, CreateInsuranceAuthorizationRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        InsurancePayer payer = payerRepository.findById(request.getPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer not found with id: " + request.getPayerId()));

        InsuranceAuthorization auth = new InsuranceAuthorization();
        auth.setPatient(encounter.getPatient());
        auth.setOrganization(encounter.getOrganization());
        auth.setPayer(payer);
        auth.setAuthorizationNumber(request.getAuthorizationNumber());
        auth.setServiceType(request.getServiceType());
        auth.setRequestedAmount(request.getRequestedAmount());
        auth.setStatus("REQUESTED");
        auth.setRequestedAt(OffsetDateTime.now());
        auth.setExpiresAt(request.getExpiresAt());

        InsuranceAuthorization saved = authorizationRepository.save(auth);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PRIOR_AUTH_REQUESTED", "Requested authorization for service: " + saved.getServiceType());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<InsuranceAuthorizationResponseDTO> getEncounterAuthorizations(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        return authorizationRepository.findByPatientId(encounter.getPatient().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InsuranceAuthorizationResponseDTO getAuthorization(UUID authId) {
        InsuranceAuthorization auth = authorizationRepository.findById(authId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance authorization not found with id: " + authId));
        return mapToDTO(auth);
    }

    public InsuranceAuthorizationResponseDTO updateAuthorization(UUID authId, UpdateInsuranceAuthorizationRequest request) {
        InsuranceAuthorization auth = authorizationRepository.findById(authId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance authorization not found with id: " + authId));

        if (request.getStatus() != null) {
            auth.setStatus(request.getStatus());
            if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
                auth.setApprovedAt(OffsetDateTime.now());
            }
        }
        if (request.getApprovedAmount() != null) auth.setApprovedAmount(request.getApprovedAmount());
        if (request.getAuthorizationNumber() != null) auth.setAuthorizationNumber(request.getAuthorizationNumber());
        if (request.getExpiresAt() != null) auth.setExpiresAt(request.getExpiresAt());

        InsuranceAuthorization saved = authorizationRepository.save(auth);
        return mapToDTO(saved);
    }

    public InsuranceAuthorizationResponseDTO mapToDTO(InsuranceAuthorization a) {
        InsuranceAuthorizationResponseDTO dto = new InsuranceAuthorizationResponseDTO();
        dto.setId(a.getId());
        if (a.getPatient() != null) dto.setPatientId(a.getPatient().getId());
        if (a.getOrganization() != null) dto.setOrganizationId(a.getOrganization().getId());
        if (a.getPayer() != null) {
            dto.setPayerId(a.getPayer().getId());
            dto.setPayerName(a.getPayer().getName());
        }
        dto.setAuthorizationNumber(a.getAuthorizationNumber());
        dto.setServiceType(a.getServiceType());
        dto.setRequestedAmount(a.getRequestedAmount());
        dto.setApprovedAmount(a.getApprovedAmount());
        dto.setStatus(a.getStatus());
        dto.setRequestedAt(a.getRequestedAt());
        dto.setApprovedAt(a.getApprovedAt());
        dto.setExpiresAt(a.getExpiresAt());
        return dto;
    }
}
