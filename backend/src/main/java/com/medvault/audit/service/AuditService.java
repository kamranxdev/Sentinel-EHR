package com.medvault.audit.service;

import com.medvault.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service("auditService")
public class AuditService extends AuditTrailService {
    public AuditService(AuditLogRepository auditLogRepository) {
        super(auditLogRepository);
    }
}
