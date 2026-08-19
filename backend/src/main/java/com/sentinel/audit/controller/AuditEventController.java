package com.sentinel.audit.controller;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-events")
@Tag(name = "Audit Trail", description = "Endpoints for accessing system audit logs and compliance records")
public class AuditEventController {

    private final AuditTrailService auditTrailService;

    public AuditEventController(AuditTrailService auditTrailService) {
        this.auditTrailService = auditTrailService;
    }

    @GetMapping
    @Operation(summary = "Get recent audit events")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentAuditLogs(
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.util.UUID organizationId) {
        
        List<AuditLog> response;
        if (organizationId != null) {
            response = auditTrailService.getRecentAuditLogsByOrganization(organizationId);
        } else {
            response = auditTrailService.getRecentAuditLogs();
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
