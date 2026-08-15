package com.sentinel.users.controller;

import com.sentinel.audit.dto.AuditLogResponseDTO;
import com.sentinel.audit.mapper.AuditLogMapper;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.users.dto.UserPasswordResetRequestDTO;
import com.sentinel.users.dto.UserResponseDTO;
import com.sentinel.users.dto.UserStatusUpdateRequestDTO;
import com.sentinel.users.dto.UserUpdateRequestDTO;
import com.sentinel.users.entity.User;
import com.sentinel.users.mapper.UserMapper;
import com.sentinel.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserService userService;
    private final AuditTrailService auditTrailService;
    private final UserMapper userMapper;
    private final AuditLogMapper auditLogMapper;

    public AdminController(UserService userService,
                           AuditTrailService auditTrailService,
                           UserMapper userMapper,
                           AuditLogMapper auditLogMapper) {
        this.userService = userService;
        this.auditTrailService = auditTrailService;
        this.userMapper = userMapper;
        this.auditLogMapper = auditLogMapper;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('USER_CREATE', 'USER_READ', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST', 'ROLE_AUDITOR')")
    public List<UserResponseDTO> getAllUsers(Authentication auth) {
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ORG_ADMIN".equals(a.getAuthority()))
                && auth.getAuthorities().stream().noneMatch(a -> "ROLE_SYS_ADMIN".equals(a.getAuthority()))) {
            User currentAdmin = userService.getUserByUsername(auth.getName()).orElse(null);
            if (currentAdmin != null && currentAdmin.getOrganization() != null) {
                return userService.getUsersByOrganization(currentAdmin.getOrganization().getId()).stream()
                        .map(userMapper::toResponseDTO)
                        .toList();
            }
        }

        return userService.getAllUsers().stream()
                .map(userMapper::toResponseDTO)
                .toList();
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'USER_CREATE')")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequestDTO payload, Authentication auth) {
        User saved = userService.updateUser(id, payload);
        auditTrailService.logAction(auth, "UPDATE_USER", "USER", String.valueOf(saved.getId()),
                "Admin updated details for user: " + saved.getUsername());

        return ResponseEntity.ok(userMapper.toResponseDTO(saved));
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'USER_CREATE')")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequestDTO payload, Authentication auth) {
        String newStatus = payload.getStatus() != null ? payload.getStatus() : "VERIFIED";
        User saved = userService.updateUserStatus(id, newStatus);

        auditTrailService.logAction(auth, "UPDATE_USER_STATUS", "USER", String.valueOf(saved.getId()),
                "Admin changed user status for " + saved.getUsername() + " to: " + newStatus);

        return ResponseEntity.ok(Map.of("message", "User status updated successfully", "status", newStatus));
    }

    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'USER_CREATE')")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id, @Valid @RequestBody UserPasswordResetRequestDTO payload, Authentication auth) {
        User user = userService.resetUserPassword(id, payload.getNewPassword());

        auditTrailService.logAction(auth, "RESET_USER_PASSWORD", "USER", String.valueOf(user.getId()),
                "Admin reset password for user: " + user.getUsername());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Notification sent to registered email."));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id, Authentication auth) {
        String targetUsername = userService.deleteUser(id);

        auditTrailService.logAction(auth, "DELETE_USER", "USER", String.valueOf(id),
                "Admin deleted user account: " + targetUsername);

        return ResponseEntity.ok(Map.of("message", "User account deleted successfully"));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('AUDIT_LOG_READ', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AUDITOR')")
    public List<AuditLogResponseDTO> getAuditLogs(@RequestParam(value = "search", required = false) String search, Authentication auth) {
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ORG_ADMIN".equals(a.getAuthority()))
                && auth.getAuthorities().stream().noneMatch(a -> "ROLE_SYS_ADMIN".equals(a.getAuthority()))) {
            User currentAdmin = userService.getUserByUsername(auth.getName()).orElse(null);
            if (currentAdmin != null && currentAdmin.getOrganization() != null) {
                return userService.getAuditLogsForOrganization(currentAdmin.getOrganization().getId(), search).stream()
                        .map(auditLogMapper::toResponseDTO)
                        .toList();
            }
        }

        return userService.getAuditLogs(search).stream()
                .map(auditLogMapper::toResponseDTO)
                .toList();
    }
}
