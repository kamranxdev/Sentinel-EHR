package com.sentinel.scheduling.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.EncounterResponseDTO;
import com.sentinel.clinical.service.EncounterService;
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
import com.sentinel.billing.entity.Invoice;
import com.sentinel.billing.repository.InvoiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppointmentActionService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentActionService.class);

    private final AppointmentRepository appointmentRepository;
    private final AppointmentCancellationRepository cancellationRepository;
    private final AppointmentRescheduleRepository rescheduleRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final EncounterService encounterService;
    private final AuditService auditService;
    private final InvoiceRepository invoiceRepository;

    public AppointmentActionService(AppointmentRepository appointmentRepository,
                                    AppointmentCancellationRepository cancellationRepository,
                                    AppointmentRescheduleRepository rescheduleRepository,
                                    AppointmentStatusHistoryRepository statusHistoryRepository,
                                    UserRepository userRepository,
                                    @Lazy EncounterService encounterService,
                                    AuditService auditService,
                                    InvoiceRepository invoiceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.cancellationRepository = cancellationRepository;
        this.rescheduleRepository = rescheduleRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
        this.encounterService = encounterService;
        this.auditService = auditService;
        this.invoiceRepository = invoiceRepository;
    }

    public AppointmentResponseDTO checkIn(UUID appointmentId, AppointmentCheckInRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "CHECKED_IN", request != null ? request.getNotes() : null);

        appt.setStatus("CHECKED_IN");
        appt.setCheckedInAt(OffsetDateTime.now());
        appt.setArrivedAt(OffsetDateTime.now());
        if (request != null && request.getNotes() != null) appt.setNotes(request.getNotes());
        appt.setUpdatedAt(OffsetDateTime.now());

        // Auto-create encounter on check-in
        if (encounterService != null && appt.getEncounterId() == null) {
            try {
                EncounterResponseDTO encounterDTO = encounterService.openEncounterFromAppointment(appt);
                appt.setEncounterId(encounterDTO.getId());
            } catch (Exception e) {
                log.warn("Failed to auto-create encounter for appointment {}: {}", appointmentId, e.getMessage());
            }
        }

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_CHECKED_IN", "Patient checked in for appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentResponseDTO markNoShow(UUID appointmentId, AppointmentNoShowRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "NO_SHOW", request != null ? request.getNotes() : null);

        appt.setStatus("NO_SHOW");
        appt.setNoShowAt(OffsetDateTime.now());
        if (request != null && request.getNotes() != null) appt.setNotes(request.getNotes());
        appt.setUpdatedAt(OffsetDateTime.now());

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_NO_SHOW", "Patient no-show recorded for appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentResponseDTO triage(UUID appointmentId, AppointmentTriageRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        recordStatusHistory(appt, "TRIAGED", request.getNotes());

        appt.setStatus("TRIAGED");
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
        appt.setUpdatedAt(OffsetDateTime.now());
        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_RESCHEDULED", "Rescheduled appointment " + appointmentId);
        }

        return mapToDTO(saved);
    }

    public AppointmentBillingResponseDTO generateBilling(UUID appointmentId, BillingGenerationRequestDTO request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        double consult = request != null && request.getConsultationFee() != null ? request.getConsultationFee() : 100.0;
        double triage = request != null && request.getTriageFee() != null ? request.getTriageFee() : 25.0;
        double lab = request != null && request.getLabFee() != null ? request.getLabFee() : 0.0;
        double pharm = request != null && request.getPharmacyFee() != null ? request.getPharmacyFee() : 0.0;
        double ins = request != null && request.getInsuranceCoverage() != null ? request.getInsuranceCoverage() : 0.0;
        double total = consult + triage + lab + pharm;
        double net = Math.max(0.0, total - ins);

        UUID invoiceId = null;
        if (appt.getPatient() != null) {
            Invoice inv = new Invoice();
            inv.setPatient(appt.getPatient());
            inv.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            inv.setTotalAmount(java.math.BigDecimal.valueOf(total));
            inv.setPaidAmount(java.math.BigDecimal.valueOf(net == 0 ? total : 0.0));
            inv.setStatus(net == 0 ? "PAID" : "ISSUED");
            inv.setIssuedAt(OffsetDateTime.now());
            Invoice savedInv = invoiceRepository.save(inv);
            invoiceId = savedInv.getId();
        }

        AppointmentBillingResponseDTO dto = new AppointmentBillingResponseDTO();
        dto.setId(invoiceId != null ? invoiceId : UUID.randomUUID());
        dto.setAppointmentId(appointmentId);
        dto.setConsultationFee(consult);
        dto.setTriageFee(triage);
        dto.setLabFee(lab);
        dto.setPharmacyFee(pharm);
        dto.setInsuranceCoverage(ins);
        dto.setNetPayable(net);
        dto.setPaymentStatus(net == 0 ? "PAID" : "PENDING");
        dto.setGeneratedAt(OffsetDateTime.now());

        if (auditService != null) {
            auditService.logEvent(appointmentId, "BILLING_GENERATED", "Generated billing for appointment " + appointmentId + ", net payable: " + net);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public AppointmentBillingResponseDTO getBillingDetails(UUID appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        AppointmentBillingResponseDTO dto = new AppointmentBillingResponseDTO();
        dto.setId(UUID.randomUUID());
        dto.setAppointmentId(appointmentId);
        dto.setConsultationFee(100.0);
        dto.setTriageFee(25.0);
        dto.setLabFee(0.0);
        dto.setPharmacyFee(0.0);
        dto.setInsuranceCoverage(0.0);
        dto.setNetPayable(125.0);
        dto.setPaymentStatus("PENDING");
        dto.setGeneratedAt(appt.getUpdatedAt() != null ? appt.getUpdatedAt() : OffsetDateTime.now());
        return dto;
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
        if (a.getDepartment() != null) dto.setDepartmentId(a.getDepartment().getId());
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getFullName());
        }
        if (a.getPractitioner() != null) {
            dto.setPractitionerId(a.getPractitioner().getId());
            dto.setPractitionerName(a.getPractitioner().getFullName());
            dto.setDoctorId(a.getPractitioner().getId());
            dto.setDoctorName(a.getPractitioner().getFullName());
        } else if (a.getCreatedBy() != null) {
            dto.setDoctorId(a.getCreatedBy().getId());
            dto.setDoctorName(a.getCreatedBy().getFullName());
        }
        dto.setSchedulingMode(a.getSchedulingMode());
        dto.setSpecialtyCode(a.getSpecialtyCode());
        dto.setEncounterType(a.getEncounterType());
        dto.setEncounterId(a.getEncounterId());
        dto.setStartsAt(a.getStartsAt());
        dto.setEndsAt(a.getEndsAt());
        dto.setStatus(a.getStatus());
        dto.setReason(a.getReason());
        dto.setNotes(a.getNotes());
        dto.setCheckedInAt(a.getCheckedInAt());
        dto.setArrivedAt(a.getArrivedAt());
        dto.setCompletedAt(a.getCompletedAt());
        dto.setNoShowAt(a.getNoShowAt());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
