package com.sentinel.audit.service;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditTrailService {

    private final AuditLogRepository auditLogRepository;

    public AuditTrailService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(String email, String userRole, String action, String entityName, String resourceId, String details) {
        AuditLog log = new AuditLog(email, userRole, action, entityName, resourceId, details);
        auditLogRepository.save(log);
    }

    @Transactional
    public void logAction(String email, String action, String entityName, String resourceId, String details) {
        logAction(email, "USER", action, entityName, resourceId, details);
    }

    @Transactional
    public void logAction(Authentication auth, String action, String entityName, String resourceId, String details) {
        String email = auth != null && auth.isAuthenticated() ? auth.getName() : "SYSTEM";
        String role = auth != null && auth.isAuthenticated() ? resolvePrimaryRole(auth) : "SYSTEM";
        logAction(email, role, action, entityName, resourceId, details);
    }

    public static String resolvePrimaryRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) return "PATIENT";
        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.contains("_READ") && !a.contains("_CREATE") && !a.contains("_UPDATE") && !a.contains("_DELETE"))
                .toList();

        if (!roles.isEmpty()) {
            return String.join(",", roles);
        }
        return "PATIENT";
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByOccurredAtDesc();
    }
}
