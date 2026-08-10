package com.sentinel.clinicalrecords.mapper;

import com.sentinel.clinicalrecords.dto.MedicalRecordRequestDTO;
import com.sentinel.clinicalrecords.dto.MedicalRecordResponseDTO;
import com.sentinel.clinicalrecords.entity.MedicalRecord;
import org.springframework.stereotype.Component;

@Component
public class MedicalRecordMapper {

    public MedicalRecord toEntity(MedicalRecordRequestDTO dto) {
        if (dto == null) return null;

        MedicalRecord record = new MedicalRecord();
        record.setDiagnosis(dto.getDiagnosis());
        record.setIcdCode(dto.getIcdCode());
        record.setSymptoms(dto.getSymptoms());
        record.setTreatmentPlan(dto.getTreatmentPlan());
        record.setNotes(dto.getNotes());
        return record;
    }

    public MedicalRecordResponseDTO toResponseDTO(MedicalRecord entity) {
        if (entity == null) return null;

        MedicalRecordResponseDTO dto = new MedicalRecordResponseDTO();
        dto.setId(entity.getId());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setIcdCode(entity.getIcdCode());
        dto.setSymptoms(entity.getSymptoms());
        dto.setTreatmentPlan(entity.getTreatmentPlan());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());

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
