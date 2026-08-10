package com.sentinel.users.controller;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
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
@PreAuthorize("hasAnyAuthority('USER_CREATE', 'USER_READ', 'AUDIT_LOG_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST', 'ROLE_AUDITOR')")
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
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (payload.containsKey("fullName") && payload.get("fullName") != null) {
            user.setFullName((String) payload.get("fullName"));
        }
        if (payload.containsKey("email") && payload.get("email") != null) {
            user.setEmail((String) payload.get("email"));
        }
        if (payload.containsKey("department")) {
            user.setDepartment((String) payload.get("department"));
        }
        if (payload.containsKey("specialization")) {
            user.setSpecialization((String) payload.get("specialization"));
        }
        if (payload.containsKey("licenseNumber")) {
            user.setLicenseNumber((String) payload.get("licenseNumber"));
        }
        if (payload.containsKey("qualifications")) {
            user.setQualifications((String) payload.get("qualifications"));
        }
        if (payload.containsKey("verificationStatus") && payload.get("verificationStatus") != null) {
            user.setVerificationStatus((String) payload.get("verificationStatus"));
        }

        if (payload.containsKey("roles") && payload.get("roles") instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> roleNames = (List<String>) payload.get("roles");
            Set<Role> updatedRoles = new HashSet<>();
            for (String r : roleNames) {
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
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
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
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
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

        return ResponseEntity.ok(Map.of("message", "Password reset successfully", "temporaryPassword", newPassword));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
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
        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        if (search == null || search.trim().isEmpty()) {
            return logs;
        }

        String q = search.toLowerCase().trim();
        return logs.stream().filter(l -> 
            (l.getUsername() != null && l.getUsername().toLowerCase().contains(q)) ||
            (l.getUserRole() != null && l.getUserRole().toLowerCase().contains(q)) ||
            (l.getAction() != null && l.getAction().toLowerCase().contains(q)) ||
            (l.getEntityName() != null && l.getEntityName().toLowerCase().contains(q)) ||
            (l.getResourceId() != null && l.getResourceId().toLowerCase().contains(q)) ||
            (l.getDetails() != null && l.getDetails().toLowerCase().contains(q))
        ).toList();
    }
}

