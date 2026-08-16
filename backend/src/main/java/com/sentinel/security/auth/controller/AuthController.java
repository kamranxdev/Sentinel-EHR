package com.sentinel.security.auth.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.response.ApiResponse;
import com.sentinel.security.auth.dto.JwtAuthResponse;
import com.sentinel.security.auth.dto.LoginRequest;
import com.sentinel.security.auth.dto.RegisterRequest;
import com.sentinel.security.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    private final AuthService authService;
    private final AuditTrailService auditService;

    public AuthController(AuthService authService,
                          AuditTrailService auditService) {
        this.authService = authService;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get token")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        String primaryRole = response.getRoles() != null && !response.getRoles().isEmpty() ? response.getRoles().iterator().next() : "PATIENT";
        auditService.logAction(response.getUsername(), primaryRole, "LOGIN", "AUTH", String.valueOf(response.getId()), "User authenticated successfully");
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new patient")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, Object> result = authService.registerPatient(registerRequest);
        auditService.logAction(registerRequest.getUsername(), "PATIENT", "REGISTER", "USER", String.valueOf(result.get("userId")), "Self-registered as patient");
        return new ResponseEntity<>(ApiResponse.success("User registered successfully", result), HttpStatus.CREATED);
    }
}
