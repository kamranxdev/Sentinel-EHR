package com.medvault.encounters.service;

import com.medvault.encounters.entity.Encounter;
import com.medvault.encounters.repository.EncounterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EncounterService {

    private final EncounterRepository encounterRepository;

    public EncounterService(EncounterRepository encounterRepository) {
        this.encounterRepository = encounterRepository;
    }

    public List<Encounter> getEncountersByPatientId(Long patientId) {
        return encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId);
    }

    public Optional<Encounter> getEncounterById(Long id) {
        return encounterRepository.findById(id);
    }

    public Encounter saveEncounter(Encounter encounter) {
        return encounterRepository.save(encounter);
    }
}
