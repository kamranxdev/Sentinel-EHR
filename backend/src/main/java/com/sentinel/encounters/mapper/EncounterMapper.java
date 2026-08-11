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
        encounter.setAdmissionType(dto.getAdmissionType());
        encounter.setAdmissionSource(dto.getAdmissionSource());
        encounter.setDepartmentName(dto.getDepartmentName());
        encounter.setAdmissionDiagnosisIcd(dto.getAdmissionDiagnosisIcd());
        if (dto.getAcuityScore() != null) {
            try {
                // Parse numeric EWS level or store string representation safely
                String scoreStr = dto.getAcuityScore().replaceAll("[^0-9]", "");
                if (!scoreStr.isEmpty()) {
                    encounter.setAcuityScore(Integer.parseInt(scoreStr));
                }
            } catch (Exception ignored) {}
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
        if (dto.getAdmissionType() != null) encounter.setAdmissionType(dto.getAdmissionType());
        if (dto.getAdmissionSource() != null) encounter.setAdmissionSource(dto.getAdmissionSource());
        if (dto.getDepartmentName() != null) encounter.setDepartmentName(dto.getDepartmentName());
        if (dto.getAdmissionDiagnosisIcd() != null) encounter.setAdmissionDiagnosisIcd(dto.getAdmissionDiagnosisIcd());
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
        dto.setAdmissionType(entity.getAdmissionType());
        dto.setAdmissionSource(entity.getAdmissionSource());
        dto.setDepartmentName(entity.getDepartmentName());
        dto.setAdmissionDiagnosisIcd(entity.getAdmissionDiagnosisIcd());
        if (entity.getAcuityScore() != null) {
            dto.setAcuityScore("Level " + entity.getAcuityScore());
        }

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
