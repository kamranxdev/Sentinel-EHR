package com.sentinel.audit.service;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service("auditTrailService")
public class AuditTrailService {

    private static final Logger logger = LoggerFactory.getLogger(AuditTrailService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditTrailService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletableFuture<AuditLog> logAction(Authentication authentication, String action, String entityName, String resourceId, String details) {
        String username = "SYSTEM";
        String primaryRole = "ROLE_SYSTEM";

        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
            List<String> authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
            if (!authorities.isEmpty()) {
                primaryRole = authorities.get(0);
            }
        }

        return logAction(username, primaryRole, action, entityName, resourceId, details);
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletableFuture<AuditLog> logAction(String username, String userRole, String action, String entityName, String resourceId, String details) {
        try {
            AuditLog log = new AuditLog(username, userRole, action, entityName, resourceId, details);
            AuditLog saved = auditLogRepository.save(log);
            logger.info("AUDIT LOG RECORDED: [{}] by user '{}' ({}) on entity '{}' (ID: {}) - {}", 
                    action, username, userRole, entityName, resourceId, details);
            return CompletableFuture.completedFuture(saved);
        } catch (Exception ex) {
            logger.error("AUDIT LOG FAILURE: Failed to save audit trail for action '{}' on entity '{}' (resource ID: {}) by user '{}': {}", 
                    action, entityName, resourceId, username, ex.getMessage(), ex);
            return CompletableFuture.completedFuture(null);
        }
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
