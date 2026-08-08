package com.medvault.authorization.abac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AbacPolicyRepository extends JpaRepository<AbacPolicy, Long> {
    Optional<AbacPolicy> findByPolicyName(String policyName);
    List<AbacPolicy> findByTargetResourceAndActionAndActiveTrue(String targetResource, String action);
}
