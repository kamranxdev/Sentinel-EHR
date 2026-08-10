package com.sentinel.diagnoses.mapper;

import com.sentinel.diagnoses.dto.DiagnosisRequestDTO;
import com.sentinel.diagnoses.dto.DiagnosisResponseDTO;
import com.sentinel.diagnoses.entity.Diagnosis;
import org.springframework.stereotype.Component;

@Component
public class DiagnosisMapper {

    public Diagnosis toEntity(DiagnosisRequestDTO dto) {
        if (dto == null) return null;

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setConditionName(dto.getConditionName());
        diagnosis.setIcdCode(dto.getIcdCode());
        diagnosis.setSnomedCode(dto.getSnomedCode());
        diagnosis.setOnsetDate(dto.getOnsetDate());
        if (dto.getStatus() != null) {
            diagnosis.setStatus(dto.getStatus());
        }
        diagnosis.setNotes(dto.getNotes());
        return diagnosis;
    }

    public DiagnosisResponseDTO toResponseDTO(Diagnosis entity) {
        if (entity == null) return null;

        DiagnosisResponseDTO dto = new DiagnosisResponseDTO();
        dto.setId(entity.getId());
        dto.setConditionName(entity.getConditionName());
        dto.setIcdCode(entity.getIcdCode());
        dto.setSnomedCode(entity.getSnomedCode());
        dto.setOnsetDate(entity.getOnsetDate());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setRecordedAt(entity.getRecordedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
            dto.setPatientCode(entity.getPatient().getPatientCode());
        }

        if (entity.getDoctor() != null) {
            dto.setDoctorId(entity.getDoctor().getId());
            dto.setDoctorName(entity.getDoctor().getFullName());
        }

        return dto;
    }
}
