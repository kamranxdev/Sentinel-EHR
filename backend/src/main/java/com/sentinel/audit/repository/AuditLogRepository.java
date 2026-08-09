package com.sentinel.audit.repository;

import com.sentinel.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByUsernameOrderByTimestampDesc(String username);
    List<AuditLog> findByEntityNameOrderByTimestampDesc(String entityName);
}
