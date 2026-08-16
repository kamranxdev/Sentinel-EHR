package com.sentinel.scheduling.repository;

import com.sentinel.scheduling.entity.AppointmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, UUID> {
    Optional<AppointmentType> findByCode(String code);
}
