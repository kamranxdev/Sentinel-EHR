package com.sentinel.audit.controller;

import com.sentinel.audit.entity.AuditLog;
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

    public AuditController(AuditTrailService auditTrailService) {
        this.auditTrailService = auditTrailService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_AUDITOR', 'AUDIT_READ')")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditTrailService.getRecentAuditLogs());
    }
}
