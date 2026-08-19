package com.sentinel.audit.repository;

import com.sentinel.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findTop100ByOrderByOccurredAtDesc();
    List<AuditLog> findTop100ByOrganizationIdOrderByOccurredAtDesc(UUID organizationId);
    List<AuditLog> findAllByOrderByOccurredAtDesc();
    List<AuditLog> findByResourceTypeOrderByOccurredAtDesc(String resourceType);

    @Query("SELECT a FROM AuditLog a WHERE LOWER(a.action) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.resourceType) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY a.occurredAt DESC")
    List<AuditLog> searchAuditLogs(@Param("query") String query);
}
