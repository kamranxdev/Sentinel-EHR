package com.sentinel.consent.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.consent.dto.ConsentTypeResponseDTO;
import com.sentinel.consent.dto.CreateConsentTypeRequest;
import com.sentinel.consent.entity.ConsentType;
import com.sentinel.consent.repository.ConsentTypeRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsentTypeService {

    private final ConsentTypeRepository consentTypeRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public ConsentTypeService(ConsentTypeRepository consentTypeRepository,
                              OrganizationRepository organizationRepository,
                              AuditService auditService) {
        this.consentTypeRepository = consentTypeRepository;
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public ConsentTypeResponseDTO createConsentType(CreateConsentTypeRequest request) {
        ConsentType ct = new ConsentType();
        ct.setCode(request.getCode());
        ct.setName(request.getName());
        ct.setDescription(request.getDescription());
        ct.setActive(true);

        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(ct::setOrganization);
        }

        ConsentType saved = consentTypeRepository.save(ct);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "CONSENT_TYPE_CREATED", "Created consent type: " + saved.getCode());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ConsentTypeResponseDTO> getAllConsentTypes() {
        return consentTypeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ConsentTypeResponseDTO mapToDTO(ConsentType ct) {
        ConsentTypeResponseDTO dto = new ConsentTypeResponseDTO();
        dto.setId(ct.getId());
        if (ct.getOrganization() != null) dto.setOrganizationId(ct.getOrganization().getId());
        dto.setCode(ct.getCode());
        dto.setName(ct.getName());
        dto.setDescription(ct.getDescription());
        dto.setActive(ct.getActive());
        return dto;
    }
}
