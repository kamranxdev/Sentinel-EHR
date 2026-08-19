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
        dto.setEmail(entity.getUserEmail() != null ? entity.getUserEmail() : entity.getEmail());
        dto.setUserRole(entity.getUserRole());
        dto.setAction(entity.getAction());
        dto.setEntityName(entity.getEntityName());
        dto.setResourceId(entity.getResourceId() != null ? entity.getResourceId().toString() : null);
        dto.setIpAddress(entity.getIpAddress());
        dto.setDetails(entity.getDetails());
        dto.setTimestamp(entity.getOccurredAt());
        return dto;
    }
}
