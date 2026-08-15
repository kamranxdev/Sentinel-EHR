package com.sentinel.audit.aspect;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Aspect
@Component
public class AuditLogAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogAspect.class);
    private final AuditLogRepository auditLogRepository;

    public AuditLogAspect(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Pointcut("@annotation(org.springframework.security.access.prepost.PreAuthorize)")
    public void preAuthorizePointcut() {}

    @Pointcut("within(com.sentinel..*.controller..*)")
    public void controllerPointcut() {}

    @AfterReturning(pointcut = "preAuthorizePointcut()", returning = "result")
    public void logAuthorizedAccess(JoinPoint joinPoint, Object result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;

        try {
            String username = auth.getName();
            String role = com.sentinel.audit.service.AuditTrailService.resolvePrimaryRole(auth);

            logger.debug("[API_ACCESS] endpoint={} user='{}' role='{}' status=AUTHORIZED", 
                    joinPoint.getSignature().toShortString(), username, role);
        } catch (Exception ex) {
            logger.error("AOP AUDIT LOG ERROR: Failed to log authorized access: {}", ex.getMessage());
        }
    }

    @AfterThrowing(pointcut = "preAuthorizePointcut() || controllerPointcut()", throwing = "ex")
    public void logDeniedAccess(JoinPoint joinPoint, Throwable ex) {
        if (!(ex instanceof AccessDeniedException)) return;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ANONYMOUS";
        String role = (auth != null && auth.isAuthenticated()) ? com.sentinel.audit.service.AuditTrailService.resolvePrimaryRole(auth) : "NONE";
        String clientIp = org.slf4j.MDC.get(com.sentinel.common.logging.MDCLoggingFilter.CLIENT_IP_MDC_KEY);
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "127.0.0.1";
        }

        try {
            AuditLog log = new AuditLog();
            log.setUsername(username);
            log.setUserRole(role);
            log.setAction("ACCESS_DENIED");
            log.setEntityName(joinPoint.getSignature().getDeclaringType().getSimpleName());
            log.setIpAddress(clientIp);
            log.setDetails("Security violation / access denied on endpoint: " + joinPoint.getSignature().toShortString() + " - " + ex.getMessage());
            log.setTimestamp(LocalDateTime.now());

            auditLogRepository.save(log);
            logger.warn("[SECURITY_AUDIT] status=DENIED action=ACCESS_DENIED endpoint={} user='{}' role='{}' ip={} details=\"{}\"", 
                    joinPoint.getSignature().toShortString(), username, role, clientIp, ex.getMessage());
        } catch (Exception loggingEx) {
            logger.error("AOP AUDIT LOG ERROR: Failed to log access denial: {}", loggingEx.getMessage());
        }
    }
}
