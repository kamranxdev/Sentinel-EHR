package com.sentinel.consent.repository;

import com.sentinel.consent.entity.ConsentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentTypeRepository extends JpaRepository<ConsentType, UUID> {
    Optional<ConsentType> findByCode(String code);
    List<ConsentType> findByActiveTrue();
}
