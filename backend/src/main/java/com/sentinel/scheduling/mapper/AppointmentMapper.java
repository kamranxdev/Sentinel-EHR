package com.sentinel.scheduling.mapper;

import com.sentinel.scheduling.dto.*;
import com.sentinel.scheduling.entity.Appointment;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    public AppointmentMapper() {
    }

    public Appointment toEntity(AppointmentRequestDTO dto) {
        if (dto == null) return null;

        Appointment appt = new Appointment();
        if (dto.getAppointmentDate() != null) {
            appt.setStartsAt(dto.getAppointmentDate());
            appt.setEndsAt(dto.getAppointmentDate().plusMinutes(30));
        }
        appt.setReason(dto.getReason());
        appt.setNotes(dto.getNotes());
        return appt;
    }

    public AppointmentResponseDTO toResponseDTO(Appointment entity) {
        if (entity == null) return null;

        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(entity.getId());
        dto.setStartsAt(entity.getStartsAt());
        dto.setEndsAt(entity.getEndsAt());
        dto.setStatus(entity.getStatus());
        dto.setStage(entity.getStage());
        dto.setReason(entity.getReason());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
        }

        if (entity.getCreatedBy() != null) {
            dto.setDoctorUsername(entity.getCreatedBy().getUsername());
        }

        return dto;
    }
}
