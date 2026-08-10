package com.sentinel.users.controller;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.users.dto.UserUpdateRequestDTO;
import com.sentinel.users.entity.User;
import com.sentinel.users.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
public class AdminController {

    private final UserService userService;
    private final AuditTrailService auditTrailService;

    public AdminController(UserService userService,
                           AuditTrailService auditTrailService) {
        this.userService = userService;
        this.auditTrailService = auditTrailService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('USER_CREATE', 'USER_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST', 'ROLE_AUDITOR')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequestDTO payload, Authentication auth) {
        User saved = userService.updateUser(id, payload);
        auditTrailService.logAction(auth, "UPDATE_USER", "USER", String.valueOf(saved.getId()),
                "Admin updated details for user: " + saved.getUsername());

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        String newStatus = payload.getOrDefault("status", "VERIFIED");
        User saved = userService.updateUserStatus(id, newStatus);

        auditTrailService.logAction(auth, "UPDATE_USER_STATUS", "USER", String.valueOf(saved.getId()),
                "Admin changed user status for " + saved.getUsername() + " to: " + newStatus);

        return ResponseEntity.ok(Map.of("message", "User status updated successfully", "status", newStatus));
    }

    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        String newPassword = payload.get("newPassword");
        User user = userService.resetUserPassword(id, newPassword);

        auditTrailService.logAction(auth, "RESET_USER_PASSWORD", "USER", String.valueOf(user.getId()),
                "Admin reset password for user: " + user.getUsername());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Notification sent to registered email."));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id, Authentication auth) {
        String targetUsername = userService.deleteUser(id);

        auditTrailService.logAction(auth, "DELETE_USER", "USER", String.valueOf(id),
                "Admin deleted user account: " + targetUsername);

        return ResponseEntity.ok(Map.of("message", "User account deleted successfully"));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('AUDIT_LOG_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public List<AuditLog> getAuditLogs(@RequestParam(value = "search", required = false) String search) {
        return userService.getAuditLogs(search);
    }
}

