package com.sentinel.audit.mapper;

import com.sentinel.audit.dto.AuditLogResponseDTO;
import com.sentinel.audit.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogResponseDTO toResponseDTO(AuditLog entity) {
        if (entity == null) return null;

        AuditLogResponseDTO dto = new AuditLogResponseDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setUserRole(entity.getUserRole());
        dto.setAction(entity.getAction());
        dto.setEntityName(entity.getEntityName());
        dto.setResourceId(entity.getResourceId());
        dto.setIpAddress(entity.getIpAddress());
        dto.setDetails(entity.getDetails());
        dto.setTimestamp(entity.getTimestamp());
        return dto;
    }
}
