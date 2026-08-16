package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.CreateOrganizationRequest;
import com.sentinel.tenancy.dto.OrganizationResponseDTO;
import com.sentinel.tenancy.dto.OrganizationSearchCriteria;
import com.sentinel.tenancy.dto.UpdateOrganizationRequest;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public OrganizationResponseDTO createOrganization(CreateOrganizationRequest request) {
        if (organizationRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Organization code already exists: " + request.getCode());
        }
        if (organizationRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Organization name already exists: " + request.getName());
        }

        Organization org = new Organization();
        org.setCode(request.getCode());
        org.setName(request.getName());
        org.setLegalName(request.getLegalName());
        org.setOrganizationType(request.getOrganizationType());
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
        if (request.getCountryCode() != null) org.setCountryCode(request.getCountryCode());
        org.setPhone(request.getPhone());
        org.setEmail(request.getEmail());
        org.setWebsite(request.getWebsite());
        org.setStatus("ACTIVE");
        org.setCreatedAt(OffsetDateTime.now());
        org.setUpdatedAt(OffsetDateTime.now());

        Organization saved = organizationRepository.save(org);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponseDTO> getOrganizations(OrganizationSearchCriteria criteria) {
        List<Organization> orgs;
        if (criteria != null && (criteria.getQuery() != null || criteria.getStatus() != null || criteria.getOrganizationType() != null)) {
            orgs = organizationRepository.searchOrganizations(criteria.getQuery(), criteria.getStatus(), criteria.getOrganizationType());
        } else {
            orgs = organizationRepository.findAll();
        }
        return orgs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizationResponseDTO getOrganization(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        return mapToDTO(org);
    }

    public OrganizationResponseDTO updateOrganization(UUID organizationId, UpdateOrganizationRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        if (request.getName() != null) org.setName(request.getName());
        if (request.getLegalName() != null) org.setLegalName(request.getLegalName());
        if (request.getOrganizationType() != null) org.setOrganizationType(request.getOrganizationType());
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
        if (request.getCountryCode() != null) org.setCountryCode(request.getCountryCode());
        if (request.getPhone() != null) org.setPhone(request.getPhone());
        if (request.getEmail() != null) org.setEmail(request.getEmail());
        if (request.getWebsite() != null) org.setWebsite(request.getWebsite());
        if (request.getStatus() != null) org.setStatus(request.getStatus());
        org.setUpdatedAt(OffsetDateTime.now());

        Organization saved = organizationRepository.save(org);
        return mapToDTO(saved);
    }

    public void deactivateOrganization(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        org.setStatus("INACTIVE");
        org.setUpdatedAt(OffsetDateTime.now());
        organizationRepository.save(org);
    }

    public OrganizationResponseDTO mapToDTO(Organization org) {
        OrganizationResponseDTO dto = new OrganizationResponseDTO();
        dto.setId(org.getId());
        dto.setCode(org.getCode());
        dto.setName(org.getName());
        dto.setLegalName(org.getLegalName());
        dto.setOrganizationType(org.getOrganizationType());
        dto.setStatus(org.getStatus());
        dto.setTimezone(org.getTimezone());
        dto.setCountryCode(org.getCountryCode());
        dto.setPhone(org.getPhone());
        dto.setEmail(org.getEmail());
        dto.setWebsite(org.getWebsite());
        dto.setCreatedAt(org.getCreatedAt());
        dto.setUpdatedAt(org.getUpdatedAt());
        return dto;
    }
}
