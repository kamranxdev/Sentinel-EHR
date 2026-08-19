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
        org.setAddressLine1(dto.getAddressLine1());
        org.setAddressLine2(dto.getAddressLine2());
        org.setLandmark(dto.getLandmark());
        org.setCity(dto.getCity());
        org.setDistrict(dto.getDistrict());
        org.setState(dto.getState());
        org.setPostalCode(dto.getPostalCode());
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
        dto.setAddressLine1(entity.getAddressLine1());
        dto.setAddressLine2(entity.getAddressLine2());
        dto.setLandmark(entity.getLandmark());
        dto.setCity(entity.getCity());
        dto.setDistrict(entity.getDistrict());
        dto.setState(entity.getState());
        dto.setPostalCode(entity.getPostalCode());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
