package com.sentinel.procedure.repository;

import com.sentinel.procedure.entity.ProcedureCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcedureCatalogRepository extends JpaRepository<ProcedureCatalog, UUID> {
    Optional<ProcedureCatalog> findByCode(String code);
}
