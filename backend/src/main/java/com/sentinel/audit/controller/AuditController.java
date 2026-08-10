package com.sentinel.audit.controller;

import com.sentinel.audit.dto.AuditLogResponseDTO;
import com.sentinel.audit.mapper.AuditLogMapper;
import com.sentinel.audit.service.AuditTrailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/audit", "/api/audit"})
public class AuditController {

    private final AuditTrailService auditTrailService;
    private final AuditLogMapper auditLogMapper;

    public AuditController(AuditTrailService auditTrailService, AuditLogMapper auditLogMapper) {
        this.auditTrailService = auditTrailService;
        this.auditLogMapper = auditLogMapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_AUDITOR', 'AUDIT_READ')")
    public ResponseEntity<List<AuditLogResponseDTO>> getAuditLogs() {
        List<AuditLogResponseDTO> logs = auditTrailService.getRecentAuditLogs().stream()
                .map(auditLogMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(logs);
    }
}
