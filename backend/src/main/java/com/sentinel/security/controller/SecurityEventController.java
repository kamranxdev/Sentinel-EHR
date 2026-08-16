package com.sentinel.security.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.security.dto.SecurityEventResponseDTO;
import com.sentinel.security.service.SecurityEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/security-events")
@Tag(name = "Security Events", description = "Endpoints for security audit logs and breach event detection")
public class SecurityEventController {

    private final SecurityEventService securityEventService;

    public SecurityEventController(SecurityEventService securityEventService) {
        this.securityEventService = securityEventService;
    }

    @GetMapping
    @Operation(summary = "Get all security events")
    public ResponseEntity<ApiResponse<List<SecurityEventResponseDTO>>> getAllSecurityEvents() {
        List<SecurityEventResponseDTO> response = securityEventService.getAllSecurityEvents();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
