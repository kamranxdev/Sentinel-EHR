package com.sentinel.organization.mapper;

import com.sentinel.organization.dto.OrganizationResponseDTO;
import com.sentinel.organization.entity.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public OrganizationResponseDTO toResponseDTO(Organization entity) {
        if (entity == null) {
            return null;
        }

        OrganizationResponseDTO dto = new OrganizationResponseDTO();
        dto.setId(entity.getId());
        dto.setOrgCode(entity.getOrgCode());
        dto.setName(entity.getName());
        dto.setLicenseNumber(entity.getLicenseNumber());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setAddress(entity.getAddress());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }
}
