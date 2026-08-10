package com.sentinel.audit.repository;

import com.sentinel.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByUsernameOrderByTimestampDesc(String username);
    List<AuditLog> findByEntityNameOrderByTimestampDesc(String entityName);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "LOWER(a.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.userRole) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.action) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.entityName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.resourceId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.details) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> searchAuditLogs(@Param("query") String query);
}
