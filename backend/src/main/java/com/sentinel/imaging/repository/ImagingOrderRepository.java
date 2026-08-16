package com.sentinel.imaging.repository;

import com.sentinel.imaging.entity.ImagingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImagingOrderRepository extends JpaRepository<ImagingOrder, Long> {
    List<ImagingOrder> findByPatientIdOrderByOrderedAtDesc(UUID patientId);
    List<ImagingOrder> findByEncounterIdOrderByOrderedAtDesc(UUID encounterId);
    List<ImagingOrder> findByStatusOrderByOrderedAtDesc(String status);
}
