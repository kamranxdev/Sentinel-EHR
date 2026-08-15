package com.sentinel.encounters.repository;

import com.sentinel.encounters.entity.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, Long> {
    List<Encounter> findByPatientId(Long patientId);
    List<Encounter> findByPatientIdOrderByEncounterDateDesc(Long patientId);
}
