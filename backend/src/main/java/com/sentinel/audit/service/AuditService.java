package com.sentinel.audit.service;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service("auditService")
public class AuditService extends AuditTrailService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        super(auditLogRepository);
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logEvent(UUID entityId, String eventType, String details) {
        String entityIdStr = entityId != null ? entityId.toString() : "";
        logAction("SYSTEM", "SYSTEM", eventType, "CLINICAL", entityIdStr, details);
    }
}
