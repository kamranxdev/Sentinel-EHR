package com.sentinel.security.repository;

import com.sentinel.security.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {
    List<SecurityEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<SecurityEvent> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
