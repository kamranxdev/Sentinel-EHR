package com.sentinel.scheduling.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.scheduling.dto.*;
import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.scheduling.entity.AppointmentCancellation;
import com.sentinel.scheduling.entity.AppointmentReschedule;
import com.sentinel.scheduling.entity.AppointmentStatusHistory;
import com.sentinel.scheduling.repository.AppointmentCancellationRepository;
import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.scheduling.repository.AppointmentRescheduleRepository;
import com.sentinel.scheduling.repository.AppointmentStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppointmentActionService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentCancellationRepository cancellationRepository;
    private final AppointmentRescheduleRepository rescheduleRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AppointmentActionService(AppointmentRepository appointmentRepository,
                                    AppointmentCancellationRepository cancellationRepository,
                                    AppointmentRescheduleRepository rescheduleRepository,
                                    AppointmentStatusHistoryRepository statusHistoryRepository,
                                    UserRepository userRepository,
                                    AuditService auditService) {
        this.appointmentRepository = appointmentRepository;
        this.cancellationRepository = cancellationRepository;
        this.rescheduleRepository = rescheduleRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public AppointmentResponseDTO checkIn(UUID appointmentId, AppointmentCheckInRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "CHECKED_IN", request.getNotes());

        appt.setStatus("CHECKED_IN");
        appt.setStage("CHECKED_IN");
        appt.setCheckedInAt(OffsetDateTime.now());
        appt.setArrivedAt(OffsetDateTime.now());
        if (request.getNotes() != null) appt.setNotes(request.getNotes());
        appt.setUpdatedAt(OffsetDateTime.now());

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_CHECKED_IN", "Patient checked in for appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentResponseDTO triage(UUID appointmentId, AppointmentTriageRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "TRIAGED", request.getNotes());

        appt.setStatus("TRIAGED");
        appt.setStage("TRIAGED");
        appt.setUpdatedAt(OffsetDateTime.now());

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_TRIAGED", "Patient triaged for appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentResponseDTO consult(UUID appointmentId, AppointmentConsultRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "COMPLETED", request.getTreatmentNotes());

        appt.setStatus("COMPLETED");
        appt.setStage("COMPLETED");
        appt.setCompletedAt(OffsetDateTime.now());
        if (request.getTreatmentNotes() != null) appt.setNotes(request.getTreatmentNotes());
        appt.setUpdatedAt(OffsetDateTime.now());

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_CONSULTED", "Doctor consultation completed for appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentResponseDTO cancel(UUID appointmentId, AppointmentCancelRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "CANCELLED", request.getCancellationReason());

        appt.setStatus("CANCELLED");
        appt.setStage("CANCELLED");
        appt.setUpdatedAt(OffsetDateTime.now());
        Appointment saved = appointmentRepository.save(appt);

        AppointmentCancellation cancellation = new AppointmentCancellation();
        cancellation.setAppointment(saved);
        cancellation.setCancellationReason(request.getCancellationReason());
        cancellation.setAdditionalComment(request.getAdditionalComment());
        cancellation.setCancelledByRole("STAFF");
        if (saved.getCreatedBy() != null) {
            cancellation.setCancelledByUser(saved.getCreatedBy());
        } else {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) cancellation.setCancelledByUser(users.get(0));
        }
        cancellationRepository.save(cancellation);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_CANCELLED", "Cancelled appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentResponseDTO reschedule(UUID appointmentId, AppointmentRescheduleRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        AppointmentReschedule reschedule = new AppointmentReschedule();
        reschedule.setAppointment(appt);
        reschedule.setOldStartsAt(appt.getStartsAt());
        reschedule.setOldEndsAt(appt.getEndsAt());
        reschedule.setNewStartsAt(request.getNewStartsAt());
        reschedule.setNewEndsAt(request.getNewEndsAt() != null ? request.getNewEndsAt() : request.getNewStartsAt().plusMinutes(30));
        reschedule.setReason(request.getReason());
        reschedule.setRescheduledAt(OffsetDateTime.now());
        reschedule.setRescheduledBy(appt.getCreatedBy());
        rescheduleRepository.save(reschedule);

        recordStatusHistory(appt, "RESCHEDULED", request.getReason());

        appt.setStartsAt(reschedule.getNewStartsAt());
        appt.setEndsAt(reschedule.getNewEndsAt());
        appt.setStatus("RESCHEDULED");
        appt.setStage("RESCHEDULED");
        appt.setUpdatedAt(OffsetDateTime.now());
        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_RESCHEDULED", "Rescheduled appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    private void recordStatusHistory(Appointment appt, String newStatus, String reason) {
        AppointmentStatusHistory history = new AppointmentStatusHistory();
        history.setAppointment(appt);
        history.setOldStatus(appt.getStatus());
        history.setNewStatus(newStatus);
        history.setReason(reason);
        history.setChangedBy(appt.getCreatedBy());
        history.setChangedAt(OffsetDateTime.now());
        statusHistoryRepository.save(history);
    }

    private AppointmentResponseDTO mapToDTO(Appointment a) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(a.getId());
        if (a.getOrganization() != null) dto.setOrganizationId(a.getOrganization().getId());
        if (a.getFacility() != null) dto.setFacilityId(a.getFacility().getId());
        if (a.getDepartment() != null) dto.setDepartmentId(a.getDepartment().getId());
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getFullName());
        }
        if (a.getCreatedBy() != null) dto.setDoctorUsername(a.getCreatedBy().getUsername());
        dto.setStartsAt(a.getStartsAt());
        dto.setEndsAt(a.getEndsAt());
        dto.setStatus(a.getStatus());
        dto.setStage(a.getStage());
        dto.setReason(a.getReason());
        dto.setNotes(a.getNotes());
        dto.setCheckedInAt(a.getCheckedInAt());
        dto.setArrivedAt(a.getArrivedAt());
        dto.setCompletedAt(a.getCompletedAt());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
