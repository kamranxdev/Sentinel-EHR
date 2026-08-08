package com.medvault.users.controller;

import com.medvault.audit.entity.AuditLog;
import com.medvault.audit.repository.AuditLogRepository;
import com.medvault.users.entity.User;
import com.medvault.users.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasAnyAuthority('USER_CREATE', 'AUDIT_LOG_READ', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserService userService, AuditLogRepository auditLogRepository) {
        this.userService = userService;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('USER_CREATE', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
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
