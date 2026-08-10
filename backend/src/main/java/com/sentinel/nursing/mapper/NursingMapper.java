package com.sentinel.nursing.mapper;

import com.sentinel.nursing.dto.EmarRecordRequestDTO;
import com.sentinel.nursing.dto.EmarRecordResponseDTO;
import com.sentinel.nursing.dto.TriageEwsRequestDTO;
import com.sentinel.nursing.dto.TriageEwsResponseDTO;
import com.sentinel.nursing.entity.EmarRecord;
import com.sentinel.nursing.entity.TriageEwsRecord;
import org.springframework.stereotype.Component;

@Component
public class NursingMapper {

    public TriageEwsRecord toTriageEntity(TriageEwsRequestDTO dto) {
        if (dto == null) return null;

        TriageEwsRecord record = new TriageEwsRecord();
        record.setChiefComplaint(dto.getChiefComplaint());
        if (dto.getTriagePriority() != null) {
            record.setTriagePriority(dto.getTriagePriority());
        }
        record.setVitalsSummary(dto.getVitalsSummary());
        record.setNotes(dto.getNotes());
        return record;
    }

    public TriageEwsResponseDTO toTriageResponseDTO(TriageEwsRecord entity) {
        if (entity == null) return null;

        TriageEwsResponseDTO dto = new TriageEwsResponseDTO();
        dto.setId(entity.getId());
        dto.setChiefComplaint(entity.getChiefComplaint());
        dto.setTriagePriority(entity.getTriagePriority());
        dto.setVitalsSummary(entity.getVitalsSummary());
        dto.setNotes(entity.getNotes());
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

    public EmarRecord toEmarEntity(EmarRecordRequestDTO dto) {
        if (dto == null) return null;

        EmarRecord record = new EmarRecord();
        record.setMedicationName(dto.getMedicationName());
        record.setDose(dto.getDose());
        record.setRoute(dto.getRoute());
        if (dto.getStatus() != null) {
            record.setStatus(dto.getStatus());
        }
        record.setNotes(dto.getNotes());
        return record;
    }

    public EmarRecordResponseDTO toEmarResponseDTO(EmarRecord entity) {
        if (entity == null) return null;

        EmarRecordResponseDTO dto = new EmarRecordResponseDTO();
        dto.setId(entity.getId());
        dto.setMedicationName(entity.getMedicationName());
        dto.setDose(entity.getDose());
        dto.setRoute(entity.getRoute());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setAdministeredAt(entity.getAdministeredAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
            dto.setPatientCode(entity.getPatient().getPatientCode());
        }

        if (entity.getAdministeredBy() != null) {
            dto.setAdministeredById(entity.getAdministeredBy().getId());
            dto.setAdministeredByName(entity.getAdministeredBy().getFullName());
        }

        if (entity.getPrescription() != null) {
            dto.setPrescriptionId(entity.getPrescription().getId());
        }

        return dto;
    }
}
