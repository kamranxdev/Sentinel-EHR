package com.sentinel.appointments.mapper;

import com.sentinel.appointments.dto.*;
import com.sentinel.appointments.entity.*;
import com.sentinel.vitals.mapper.VitalsMapper;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    private final VitalsMapper vitalsMapper;

    public AppointmentMapper(VitalsMapper vitalsMapper) {
        this.vitalsMapper = vitalsMapper;
    }

    public Appointment toEntity(AppointmentRequestDTO dto) {
        if (dto == null) return null;

        Appointment appt = new Appointment();
        appt.setAppointmentDate(dto.getAppointmentDate());
        if (dto.getStatus() != null) appt.setStatus(dto.getStatus());
        if (dto.getStage() != null) appt.setStage(dto.getStage());
        appt.setReason(dto.getReason());
        appt.setNotes(dto.getNotes());
        return appt;
    }

    public AppointmentResponseDTO toResponseDTO(Appointment entity) {
        if (entity == null) return null;

        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(entity.getId());
        dto.setAppointmentDate(entity.getAppointmentDate());
        dto.setStatus(entity.getStatus());
        dto.setStage(entity.getStage());
        dto.setReason(entity.getReason());
        dto.setNotes(entity.getNotes());
        dto.setInsuranceVerified(entity.getInsuranceVerified());
        dto.setInsuranceDetails(entity.getInsuranceDetails());
        dto.setReportsUploaded(entity.getReportsUploaded());
        dto.setFollowUpDate(entity.getFollowUpDate());
        dto.setArrivedAt(entity.getArrivedAt());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
            dto.setPatientCode(entity.getPatient().getPatientCode());
        }

        if (entity.getDoctor() != null) {
            dto.setDoctorId(entity.getDoctor().getId());
            dto.setDoctorName(entity.getDoctor().getFullName());
            dto.setDoctorSpecialization(entity.getDoctor().getSpecialization());
        }

        if (entity.getVitals() != null) {
            dto.setVitals(vitalsMapper.toResponseDTO(entity.getVitals()));
        }

        return dto;
    }

    public AppointmentLabOrderDTO toLabOrderDTO(AppointmentLabOrder entity) {
        if (entity == null) return null;

        AppointmentLabOrderDTO dto = new AppointmentLabOrderDTO();
        dto.setId(entity.getId());
        if (entity.getAppointment() != null) {
            dto.setAppointmentId(entity.getAppointment().getId());
        }
        dto.setTestName(entity.getTestName());
        dto.setPriority(entity.getPriority());
        dto.setClinicalIndications(entity.getClinicalIndications());
        if (entity.getOrderedBy() != null) {
            dto.setOrderedById(entity.getOrderedBy().getId());
            dto.setOrderedByName(entity.getOrderedBy().getFullName());
        }
        dto.setOrderedAt(entity.getOrderedAt());
        return dto;
    }

    public AppointmentLabOrder toLabOrderEntity(AppointmentLabOrderDTO dto) {
        if (dto == null) return null;

        AppointmentLabOrder entity = new AppointmentLabOrder();
        entity.setTestName(dto.getTestName());
        entity.setPriority(dto.getPriority());
        entity.setClinicalIndications(dto.getClinicalIndications());
        return entity;
    }

    public AppointmentNoteResponseDTO toNoteResponseDTO(AppointmentNote entity) {
        if (entity == null) return null;

        AppointmentNoteResponseDTO dto = new AppointmentNoteResponseDTO();
        dto.setId(entity.getId());
        if (entity.getAppointment() != null) {
            dto.setAppointmentId(entity.getAppointment().getId());
        }
        if (entity.getAuthor() != null) {
            dto.setAuthorId(entity.getAuthor().getId());
            dto.setAuthorName(entity.getAuthor().getFullName());
        }
        dto.setNoteType(entity.getNoteType());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public AppointmentCancellationResponseDTO toCancellationResponseDTO(AppointmentCancellation entity) {
        if (entity == null) return null;

        AppointmentCancellationResponseDTO dto = new AppointmentCancellationResponseDTO();
        dto.setId(entity.getId());
        if (entity.getAppointment() != null) {
            dto.setAppointmentId(entity.getAppointment().getId());
        }
        if (entity.getCancelledByUser() != null) {
            dto.setCancelledByUserId(entity.getCancelledByUser().getId());
            dto.setCancelledByUserName(entity.getCancelledByUser().getFullName());
        }
        dto.setCancelledByRole(entity.getCancelledByRole());
        dto.setCancellationReason(entity.getCancellationReason());
        dto.setAdditionalComment(entity.getAdditionalComment());
        dto.setRefundStatus(entity.getRefundStatus());
        dto.setCancelledAt(entity.getCancelledAt());
        return dto;
    }

    public AppointmentBillingResponseDTO toBillingResponseDTO(AppointmentBilling entity) {
        if (entity == null) return null;

        AppointmentBillingResponseDTO dto = new AppointmentBillingResponseDTO();
        dto.setId(entity.getId());
        if (entity.getAppointment() != null) {
            dto.setAppointmentId(entity.getAppointment().getId());
        }
        dto.setConsultationFee(entity.getConsultationFee());
        dto.setTriageFee(entity.getTriageFee());
        dto.setLabFee(entity.getLabFee());
        dto.setPharmacyFee(entity.getPharmacyFee());
        dto.setInsuranceCoverage(entity.getInsuranceCoverage());
        dto.setNetPayable(entity.getNetPayable());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setGeneratedAt(entity.getGeneratedAt());
        return dto;
    }
}
