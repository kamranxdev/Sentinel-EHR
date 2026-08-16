package com.sentinel.service;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.audit.service.AuditTrailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuditServiceTest {

    private AuditLogRepository auditLogRepository;
    private AuditTrailService auditService;

    @BeforeEach
    public void setUp() {
        auditLogRepository = mock(AuditLogRepository.class);
        auditService = new AuditTrailService(auditLogRepository);
    }

    @Test
    public void testLogAction_Success() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        auditService.logAction((Authentication) null, "READ", "PATIENT", "101", "Accessed patient file");

        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }
}
