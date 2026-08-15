package com.sentinel.users.controller;

import com.sentinel.audit.dto.AuditLogResponseDTO;
import com.sentinel.audit.mapper.AuditLogMapper;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.organization.dto.OrganizationResponseDTO;
import com.sentinel.organization.dto.OrganizationStatusUpdateDTO;
import com.sentinel.organization.service.OrganizationService;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dedicated System Administrator Controller.
 * Platform-wide multi-tenant governance, organization approvals, global user management, and system audit logs.
 */
@RestController
@RequestMapping("/api/v1/sys-admin")
@PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
public class SysAdminController {

    private final OrganizationService organizationService;
    private final UserService userService;
    private final AuditTrailService auditTrailService;
    private final UserMapper userMapper;
    private final AuditLogMapper auditLogMapper;

    public SysAdminController(OrganizationService organizationService,
                              UserService userService,
                              AuditTrailService auditTrailService,
                              UserMapper userMapper,
                              AuditLogMapper auditLogMapper) {
        this.organizationService = organizationService;
        this.userService = userService;
        this.auditTrailService = auditTrailService;
        this.userMapper = userMapper;
        this.auditLogMapper = auditLogMapper;
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<OrganizationResponseDTO>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @PatchMapping("/organizations/{id}/status")
    public ResponseEntity<OrganizationResponseDTO> updateOrganizationStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationStatusUpdateDTO payload,
            Authentication auth) {
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(id, payload, auth));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsersGlobal() {
        return ResponseEntity.ok(userService.getAllUsers().stream()
                .map(userMapper::toResponseDTO)
                .toList());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> updateUserGlobal(@PathVariable Long id, @Valid @RequestBody UserUpdateRequestDTO payload, Authentication auth) {
        User saved = userService.updateUser(id, payload);
        auditTrailService.logAction(auth, "SYS_ADMIN_UPDATE_USER", "USER", String.valueOf(saved.getId()),
                "System Admin updated user account: " + saved.getUsername());
        return ResponseEntity.ok(userMapper.toResponseDTO(saved));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatusGlobal(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequestDTO payload, Authentication auth) {
        String newStatus = payload.getStatus() != null ? payload.getStatus() : "VERIFIED";
        User saved = userService.updateUserStatus(id, newStatus);
        auditTrailService.logAction(auth, "SYS_ADMIN_UPDATE_USER_STATUS", "USER", String.valueOf(saved.getId()),
                "System Admin changed status for " + saved.getUsername() + " to " + newStatus);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully", "status", newStatus));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUserGlobal(@PathVariable Long id, Authentication auth) {
        String targetUsername = userService.deleteUser(id);
        auditTrailService.logAction(auth, "SYS_ADMIN_DELETE_USER", "USER", String.valueOf(id),
                "System Admin deleted user account: " + targetUsername);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponseDTO>> getGlobalAuditLogs(@RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(userService.getAuditLogs(search).stream()
                .map(auditLogMapper::toResponseDTO)
                .toList());
    }

    @GetMapping("/system-stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        List<OrganizationResponseDTO> orgs = organizationService.getAllOrganizations();
        List<User> users = userService.getAllUsers();

        long verifiedOrgs = orgs.stream().filter(o -> "VERIFIED".equalsIgnoreCase(o.getStatus())).count();
        long pendingOrgs = orgs.stream().filter(o -> "PENDING_VERIFICATION".equalsIgnoreCase(o.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrganizations", orgs.size());
        stats.put("verifiedOrganizations", verifiedOrgs);
        stats.put("pendingOrganizations", pendingOrgs);
        stats.put("totalSystemUsers", users.size());
        stats.put("systemHealth", "OPERATIONAL");

        return ResponseEntity.ok(stats);
    }
}
