package com.sentinel.laboratory.repository;

import com.sentinel.laboratory.entity.LabOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabOrderItemRepository extends JpaRepository<LabOrderItem, UUID> {
    List<LabOrderItem> findByLabOrderId(Long labOrderId);
}
