package com.sentinel.terminology.repository;

import com.sentinel.terminology.entity.CodeSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CodeSystemRepository extends JpaRepository<CodeSystem, UUID> {
    Optional<CodeSystem> findByCode(String code);
}
