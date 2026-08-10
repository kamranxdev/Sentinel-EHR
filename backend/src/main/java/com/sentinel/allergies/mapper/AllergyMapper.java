package com.sentinel.allergies.mapper;

import com.sentinel.allergies.dto.AllergyRequestDTO;
import com.sentinel.allergies.dto.AllergyResponseDTO;
import com.sentinel.allergies.entity.Allergy;
import org.springframework.stereotype.Component;

@Component
public class AllergyMapper {

    public Allergy toEntity(AllergyRequestDTO dto) {
        if (dto == null) return null;

        Allergy allergy = new Allergy();
        allergy.setAllergenName(dto.getAllergenName());
        allergy.setAllergenCode(dto.getAllergenCode());
        allergy.setCategory(dto.getCategory());
        allergy.setSeverity(dto.getSeverity());
        allergy.setReactionDescription(dto.getReactionDescription());
        if (dto.getStatus() != null) {
            allergy.setStatus(dto.getStatus());
        }
        return allergy;
    }

    public AllergyResponseDTO toResponseDTO(Allergy entity) {
        if (entity == null) return null;

        AllergyResponseDTO dto = new AllergyResponseDTO();
        dto.setId(entity.getId());
        dto.setAllergenName(entity.getAllergenName());
        dto.setAllergenCode(entity.getAllergenCode());
        dto.setCategory(entity.getCategory());
        dto.setSeverity(entity.getSeverity());
        dto.setReactionDescription(entity.getReactionDescription());
        dto.setStatus(entity.getStatus());
        dto.setRecordedAt(entity.getRecordedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
            dto.setPatientCode(entity.getPatient().getPatientCode());
        }

        if (entity.getRecordedBy() != null) {
            dto.setRecordedById(entity.getRecordedBy().getId());
            dto.setRecordedByName(entity.getRecordedBy().getFullName());
        }

        return dto;
    }
}
