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

        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            username = authentication.getName();
            primaryRole = resolvePrimaryRole(authentication);
        }

        return logAction(username, primaryRole, action, entityName, resourceId, details);
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletableFuture<AuditLog> logAction(String username, String action, String entityName, String resourceId, String details) {
        return logAction(username != null ? username : "SYSTEM", "ROLE_USER", action, entityName, resourceId, details);
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletableFuture<AuditLog> logAction(String username, String userRole, String action, String entityName, String resourceId, String details) {
        try {
            String clientIp = org.slf4j.MDC.get(com.sentinel.common.logging.MDCLoggingFilter.CLIENT_IP_MDC_KEY);
            if (clientIp == null || clientIp.isBlank()) {
                clientIp = "127.0.0.1";
            }
            String traceId = org.slf4j.MDC.get(com.sentinel.common.logging.MDCLoggingFilter.TRACE_ID_MDC_KEY);
            if (traceId == null || traceId.isBlank()) {
                traceId = "N/A";
            }

            AuditLog log = new AuditLog(username, userRole, action, entityName, resourceId, details);
            log.setIpAddress(clientIp);

            AuditLog saved = auditLogRepository.save(log);
            logger.info("[AUDIT] status=SUCCESS action={} entity={} entityId={} user='{}' role='{}' ip={} traceId={} details=\"{}\"",
                    action, entityName, resourceId != null ? resourceId : "N/A", username, userRole, clientIp, traceId, details);
            return CompletableFuture.completedFuture(saved);
        } catch (Exception ex) {
            logger.error("[AUDIT_FAILURE] action={} entity={} entityId={} user='{}' error=\"{}\"", 
                    action, entityName, resourceId, username, ex.getMessage(), ex);
            return CompletableFuture.completedFuture(null);
        }
    }

    public static String resolvePrimaryRole(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return "ROLE_SYSTEM";
        }

        if (auth.getPrincipal() instanceof com.sentinel.authorization.security.UserPrincipal principal) {
            if (principal.getRoles() != null && !principal.getRoles().isEmpty()) {
                return String.join(",", principal.getRoles());
            }
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .toList();

        if (!roles.isEmpty()) {
            return String.join(",", roles);
        }

        List<String> authorities = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        if (!authorities.isEmpty()) {
            return authorities.get(0);
        }

        return "ROLE_USER";
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
