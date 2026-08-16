package com.sentinel.security.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.security.dto.BreakGlassRequestDTO;
import com.sentinel.security.dto.BreakGlassResponseDTO;
import com.sentinel.security.service.BreakGlassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/break-glass")
@Tag(name = "Break-Glass Protocol", description = "Endpoints for emergency patient chart access overrides and security audit")
public class BreakGlassController {

    private final BreakGlassService breakGlassService;

    public BreakGlassController(BreakGlassService breakGlassService) {
        this.breakGlassService = breakGlassService;
    }

    @PostMapping
    @Operation(summary = "Initiate emergency break-glass override")
    public ResponseEntity<ApiResponse<BreakGlassResponseDTO>> requestEmergencyAccess(
            @Valid @RequestBody BreakGlassRequestDTO payload,
            Authentication authentication,
            HttpServletRequest request) {
        if (authentication != null && payload.getUsername() == null) {
            payload.setUsername(authentication.getName());
        }
        String clientIp = request != null ? request.getRemoteAddr() : "127.0.0.1";
        BreakGlassResponseDTO response = breakGlassService.requestEmergencyAccess(payload, clientIp);
        return new ResponseEntity<>(ApiResponse.success("Break-glass override granted", response), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all break-glass records")
    public ResponseEntity<ApiResponse<List<BreakGlassResponseDTO>>> getAllRecords() {
        List<BreakGlassResponseDTO> response = breakGlassService.getAllRecords();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get break-glass record by ID")
    public ResponseEntity<ApiResponse<BreakGlassResponseDTO>> getRecord(@PathVariable Long id) {
        BreakGlassResponseDTO response = breakGlassService.getRecord(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/revoke")
    @Operation(summary = "Revoke break-glass override session")
    public ResponseEntity<ApiResponse<BreakGlassResponseDTO>> revokeRecord(@PathVariable Long id) {
        BreakGlassResponseDTO response = breakGlassService.revokeRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Break-glass override revoked successfully", response));
    }
}
