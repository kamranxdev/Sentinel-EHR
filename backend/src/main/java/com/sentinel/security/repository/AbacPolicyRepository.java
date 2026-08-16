package com.sentinel.security.repository;

import com.sentinel.security.entity.AbacPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AbacPolicyRepository extends JpaRepository<AbacPolicy, UUID> {
    Optional<AbacPolicy> findByName(String name);
    List<AbacPolicy> findByResourceTypeAndActionAndActiveTrue(String resourceType, String action);
}
