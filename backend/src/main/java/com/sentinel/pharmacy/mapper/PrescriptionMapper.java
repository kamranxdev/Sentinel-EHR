package com.sentinel.pharmacy.mapper;

import com.sentinel.pharmacy.dto.PrescriptionRequestDTO;
import com.sentinel.pharmacy.dto.PrescriptionResponseDTO;
import com.sentinel.pharmacy.entity.Prescription;
import org.springframework.stereotype.Component;

@Component
public class PrescriptionMapper {

    public Prescription toEntity(PrescriptionRequestDTO dto) {
        if (dto == null) return null;

        Prescription entity = new Prescription();
        entity.setMedicationName(dto.getMedicationName());
        entity.setRxNormCode(dto.getRxNormCode());
        entity.setDosage(dto.getDosage());
        entity.setRoute(dto.getRoute());
        entity.setFrequency(dto.getFrequency());
        entity.setDurationDays(dto.getDurationDays());
        if (dto.getRefills() != null) {
            entity.setRefills(dto.getRefills());
        }
        entity.setInstructions(dto.getInstructions());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        return entity;
    }

    public PrescriptionResponseDTO toResponseDTO(Prescription entity) {
        if (entity == null) return null;

        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setId(entity.getId());
        dto.setMedicationName(entity.getMedicationName());
        dto.setRxNormCode(entity.getRxNormCode());
        dto.setDosage(entity.getDosage());
        dto.setRoute(entity.getRoute());
        dto.setFrequency(entity.getFrequency());
        dto.setDurationDays(entity.getDurationDays());
        dto.setRefills(entity.getRefills());
        dto.setInstructions(entity.getInstructions());
        dto.setStatus(entity.getStatus());
        dto.setPrescribedAt(entity.getPrescribedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
        }

        if (entity.getDoctor() != null) {
            dto.setDoctorId(entity.getDoctor().getId());
            dto.setDoctorName(entity.getDoctor().getFullName());
        }

        return dto;
    }
}
