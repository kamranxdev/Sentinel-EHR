package com.sentinel.identity.repository;

import com.sentinel.identity.entity.PractitionerSpecialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PractitionerSpecialtyRepository extends JpaRepository<PractitionerSpecialty, UUID> {
    List<PractitionerSpecialty> findByPractitionerId(UUID practitionerId);
}
