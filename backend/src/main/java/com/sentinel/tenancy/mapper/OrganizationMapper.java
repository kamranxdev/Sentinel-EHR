package com.sentinel.tenancy.mapper;

import com.sentinel.tenancy.dto.OrganizationRequestDTO;
import com.sentinel.tenancy.dto.OrganizationResponseDTO;
import com.sentinel.tenancy.entity.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public Organization toEntity(OrganizationRequestDTO dto) {
        if (dto == null) return null;
        Organization org = new Organization();
        org.setCode(dto.getCode());
        org.setName(dto.getName());
        org.setLegalName(dto.getLegalName());
        org.setOrganizationType(dto.getOrganizationType());
        org.setPhone(dto.getPhone());
        org.setEmail(dto.getEmail());
        org.setWebsite(dto.getWebsite());
        return org;
    }

    public OrganizationResponseDTO toDTO(Organization entity) {
        if (entity == null) return null;
        OrganizationResponseDTO dto = new OrganizationResponseDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setLegalName(entity.getLegalName());
        dto.setOrganizationType(entity.getOrganizationType());
        dto.setStatus(entity.getStatus());
        dto.setTimezone(entity.getTimezone());
        dto.setCountryCode(entity.getCountryCode());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setWebsite(entity.getWebsite());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
