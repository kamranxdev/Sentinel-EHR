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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

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

        try {
            AuditLog log = new AuditLog(username, role, "ACCESS_DENIED", joinPoint.getSignature().getDeclaringType().getSimpleName(), "127.0.0.1", "Access denied on endpoint: " + joinPoint.getSignature().toShortString());
            auditLogRepository.save(log);
            logger.warn("[SECURITY_AUDIT] status=DENIED action=ACCESS_DENIED endpoint={} user='{}' role='{}'", 
                    joinPoint.getSignature().toShortString(), username, role);
        } catch (Exception loggingEx) {
            logger.error("AOP AUDIT LOG ERROR: Failed to log access denial: {}", loggingEx.getMessage());
        }
    }
}
