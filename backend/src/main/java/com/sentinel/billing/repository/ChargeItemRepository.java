package com.sentinel.billing.repository;

import com.sentinel.billing.entity.ChargeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChargeItemRepository extends JpaRepository<ChargeItem, UUID> {
    List<ChargeItem> findByEncounterIdOrderByChargedAtDesc(UUID encounterId);
    List<ChargeItem> findByPatientIdOrderByChargedAtDesc(UUID patientId);
}
