package com.sentinel.auth.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.auth.dto.JwtAuthResponse;
import com.sentinel.auth.dto.LoginRequest;
import com.sentinel.auth.dto.RegisterRequest;
import com.sentinel.auth.service.AuthService;
import com.sentinel.users.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    private final AuthService authService;
    private final AuditTrailService auditService;

    public AuthController(AuthService authService,
                          AuditTrailService auditService) {
        this.authService = authService;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            JwtAuthResponse response = authService.login(loginRequest);
            String primaryRole = response.getRoles().isEmpty() ? "ROLE_USER" : response.getRoles().iterator().next();
            auditService.logAction(response.getUsername(), primaryRole, "LOGIN", "AUTH", String.valueOf(response.getId()), "User authenticated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "UNAUTHORIZED", "message", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            Map<String, Object> result = authService.registerPatient(registerRequest);
            String username = (String) result.get("username");
            String patientCode = (String) result.get("patientCode");
            Long userId = (Long) result.get("userId");

            auditService.logAction(username, "ROLE_PATIENT", "REGISTER", "USER", String.valueOf(userId), "Public user self-registered as ROLE_PATIENT with linked patient profile MRN: " + patientCode);

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", e.getMessage()));
        }
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<?> createUserByAdmin(@RequestBody RegisterRequest registerRequest, Authentication auth) {
        try {
            User saved = authService.createUserByAdmin(registerRequest);
            auditService.logAction(auth, "CREATE_STAFF", "USER", String.valueOf(saved.getId()), "Admin created account for " + saved.getUsername() + " with roles: " + registerRequest.getRoles());

            return ResponseEntity.ok(Map.of("message", "Staff account created successfully!", "userId", saved.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        JwtAuthResponse response = authService.getCurrentUserResponse(authentication.getName());
        return ResponseEntity.ok(response);
    }
}

