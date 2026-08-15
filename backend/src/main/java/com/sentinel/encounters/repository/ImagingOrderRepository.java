package com.sentinel.encounters.repository;

import com.sentinel.encounters.entity.ImagingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagingOrderRepository extends JpaRepository<ImagingOrder, Long> {
    List<ImagingOrder> findByPatientIdOrderByOrderedAtDesc(Long patientId);
    List<ImagingOrder> findByEncounterIdOrderByOrderedAtDesc(Long encounterId);
    List<ImagingOrder> findByStatusOrderByOrderedAtDesc(String status);
}
