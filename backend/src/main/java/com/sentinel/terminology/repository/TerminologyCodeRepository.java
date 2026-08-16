package com.sentinel.terminology.repository;

import com.sentinel.terminology.entity.TerminologyCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TerminologyCodeRepository extends JpaRepository<TerminologyCode, UUID> {
    List<TerminologyCode> findByCodeSystemId(UUID codeSystemId);
    Optional<TerminologyCode> findByCodeSystemIdAndCode(UUID codeSystemId, String code);

    @Query("SELECT t FROM TerminologyCode t WHERE LOWER(t.code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.display) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TerminologyCode> searchCodes(@Param("query") String query);
}
