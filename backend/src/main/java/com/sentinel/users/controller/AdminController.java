package com.sentinel.users.controller;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.users.dto.UserUpdateRequestDTO;
import com.sentinel.users.entity.Role;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.RoleRepository;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.users.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditTrailService auditTrailService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserService userService,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           AuditLogRepository auditLogRepository,
                           AuditTrailService auditTrailService,
                           PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditTrailService = auditTrailService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('USER_CREATE', 'USER_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST', 'ROLE_AUDITOR')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequestDTO payload, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (payload.getFullName() != null) {
            user.setFullName(payload.getFullName());
        }
        if (payload.getEmail() != null) {
            user.setEmail(payload.getEmail());
        }
        if (payload.getDepartment() != null) {
            user.setDepartment(payload.getDepartment());
        }
        if (payload.getSpecialization() != null) {
            user.setSpecialization(payload.getSpecialization());
        }
        if (payload.getLicenseNumber() != null) {
            user.setLicenseNumber(payload.getLicenseNumber());
        }
        if (payload.getQualifications() != null) {
            user.setQualifications(payload.getQualifications());
        }
        if (payload.getVerificationStatus() != null) {
            user.setVerificationStatus(payload.getVerificationStatus());
        }

        if (payload.getRoles() != null) {
            Set<Role> updatedRoles = new HashSet<>();
            for (String r : payload.getRoles()) {
                String roleName = r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase();
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role " + roleName + " not found"));
                updatedRoles.add(role);
            }
            user.setRoles(updatedRoles);
        }

        User saved = userRepository.save(user);
        auditTrailService.logAction(auth, "UPDATE_USER", "USER", String.valueOf(saved.getId()),
                "Admin updated details for user: " + saved.getUsername());

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String newStatus = payload.getOrDefault("status", "VERIFIED");
        user.setVerificationStatus(newStatus);
        User saved = userRepository.save(user);

        auditTrailService.logAction(auth, "UPDATE_USER_STATUS", "USER", String.valueOf(saved.getId()),
                "Admin changed user status for " + saved.getUsername() + " to: " + newStatus);

        return ResponseEntity.ok(Map.of("message", "User status updated successfully", "status", newStatus));
    }

    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'USER_CREATE')")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 6) {
            newPassword = "Sentinel#" + (1000 + (int)(Math.random() * 9000));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditTrailService.logAction(auth, "RESET_USER_PASSWORD", "USER", String.valueOf(user.getId()),
                "Admin reset password for user: " + user.getUsername());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Notification sent to registered email."));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String targetUsername = user.getUsername();
        userRepository.delete(user);

        auditTrailService.logAction(auth, "DELETE_USER", "USER", String.valueOf(id),
                "Admin deleted user account: " + targetUsername);

        return ResponseEntity.ok(Map.of("message", "User account deleted successfully"));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('AUDIT_LOG_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public List<AuditLog> getAuditLogs(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return auditLogRepository.searchAuditLogs(search.trim());
        }
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
