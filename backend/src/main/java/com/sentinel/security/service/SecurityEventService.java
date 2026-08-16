package com.sentinel.security.service;

import com.sentinel.security.dto.SecurityEventResponseDTO;
import com.sentinel.security.entity.SecurityEvent;
import com.sentinel.security.repository.SecurityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;

    public SecurityEventService(SecurityEventRepository securityEventRepository) {
        this.securityEventRepository = securityEventRepository;
    }

    public List<SecurityEventResponseDTO> getAllSecurityEvents() {
        return securityEventRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SecurityEventResponseDTO mapToDTO(SecurityEvent e) {
        SecurityEventResponseDTO dto = new SecurityEventResponseDTO();
        dto.setId(e.getId());
        if (e.getOrganization() != null) dto.setOrganizationId(e.getOrganization().getId());
        if (e.getUser() != null) {
            dto.setUserId(e.getUser().getId());
            dto.setUsername(e.getUser().getUsername());
        }
        dto.setEventType(e.getEventType());
        dto.setIpAddress(e.getIpAddress());
        dto.setUserAgent(e.getUserAgent());
        dto.setMetadata(e.getMetadata());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
