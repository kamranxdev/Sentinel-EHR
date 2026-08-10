package com.sentinel.encounters.mapper;

import com.sentinel.encounters.dto.EncounterRequestDTO;
import com.sentinel.encounters.dto.EncounterResponseDTO;
import com.sentinel.encounters.entity.Encounter;
import org.springframework.stereotype.Component;

@Component
public class EncounterMapper {

    public Encounter toEntity(EncounterRequestDTO dto) {
        if (dto == null) return null;

        Encounter encounter = new Encounter();
        encounter.setEncounterType(dto.getEncounterType());
        encounter.setChiefComplaint(dto.getChiefComplaint());
        encounter.setClinicalNotes(dto.getClinicalNotes());
        encounter.setDischargeSummary(dto.getDischargeSummary());
        if (dto.getStatus() != null) {
            encounter.setStatus(dto.getStatus());
        }
        if (dto.getEncounterDate() != null) {
            encounter.setEncounterDate(dto.getEncounterDate());
        }
        return encounter;
    }

    public void updateEntityFromDTO(EncounterRequestDTO dto, Encounter encounter) {
        if (dto == null || encounter == null) return;

        if (dto.getEncounterType() != null) encounter.setEncounterType(dto.getEncounterType());
        if (dto.getChiefComplaint() != null) encounter.setChiefComplaint(dto.getChiefComplaint());
        if (dto.getClinicalNotes() != null) encounter.setClinicalNotes(dto.getClinicalNotes());
        if (dto.getDischargeSummary() != null) encounter.setDischargeSummary(dto.getDischargeSummary());
        if (dto.getStatus() != null) encounter.setStatus(dto.getStatus());
        if (dto.getEncounterDate() != null) encounter.setEncounterDate(dto.getEncounterDate());
    }

    public EncounterResponseDTO toResponseDTO(Encounter entity) {
        if (entity == null) return null;

        EncounterResponseDTO dto = new EncounterResponseDTO();
        dto.setId(entity.getId());
        dto.setEncounterType(entity.getEncounterType());
        dto.setChiefComplaint(entity.getChiefComplaint());
        dto.setClinicalNotes(entity.getClinicalNotes());
        dto.setDischargeSummary(entity.getDischargeSummary());
        dto.setStatus(entity.getStatus());
        dto.setEncounterDate(entity.getEncounterDate());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
            dto.setPatientCode(entity.getPatient().getPatientCode());
        }

        if (entity.getAttendingProvider() != null) {
            dto.setAttendingProviderId(entity.getAttendingProvider().getId());
            dto.setAttendingProviderName(entity.getAttendingProvider().getFullName());
        }

        return dto;
    }
}
