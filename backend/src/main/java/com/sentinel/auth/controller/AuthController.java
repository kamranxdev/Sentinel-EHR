package com.sentinel.auth.controller;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.auth.dto.JwtAuthResponse;
import com.sentinel.auth.dto.LoginRequest;
import com.sentinel.auth.dto.RegisterRequest;
import com.sentinel.auth.service.AuthService;
import com.sentinel.users.dto.UserResponseDTO;
import com.sentinel.users.entity.User;
import com.sentinel.users.mapper.UserMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final AuditTrailService auditService;
    private final UserMapper userMapper;

    public AuthController(AuthService authService,
                          AuditTrailService auditService,
                          UserMapper userMapper) {
        this.authService = authService;
        this.auditService = auditService;
        this.userMapper = userMapper;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        String primaryRole = response.getRoles().isEmpty() ? "ROLE_PATIENT" : response.getRoles().iterator().next();
        auditService.logAction(response.getUsername(), primaryRole, "LOGIN", "AUTH", String.valueOf(response.getId()), "User authenticated successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, Object> result = authService.registerPatient(registerRequest);
        String username = (String) result.get("username");
        String patientCode = (String) result.get("patientCode");
        Long userId = (Long) result.get("userId");

        auditService.logAction(username, "ROLE_PATIENT", "REGISTER", "USER", String.valueOf(userId), "Public user self-registered as ROLE_PATIENT with linked patient profile MRN: " + patientCode);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'USER_CREATE')")
    public ResponseEntity<UserResponseDTO> createUserByAdmin(@Valid @RequestBody RegisterRequest registerRequest, Authentication auth) {
        User saved = authService.createUserByAdmin(registerRequest);
        auditService.logAction(auth, "CREATE_STAFF", "USER", String.valueOf(saved.getId()), "Admin created account for " + saved.getUsername() + " with roles: " + registerRequest.getRoles());

        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponseDTO(saved));
    }

    @GetMapping("/me")
    public ResponseEntity<JwtAuthResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        JwtAuthResponse response = authService.getCurrentUserResponse(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
