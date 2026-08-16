package com.sentinel.appointments.controller;

import com.sentinel.appointments.dto.*;
import com.sentinel.appointments.entity.*;
import com.sentinel.appointments.mapper.AppointmentMapper;
import com.sentinel.appointments.service.AppointmentService;
import com.sentinel.appointments.service.AppointmentWorkflowService;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.mapper.DiagnosisMapper;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.mapper.PrescriptionMapper;
import com.sentinel.users.dto.DoctorRecommendationDTO;
import com.sentinel.users.service.DoctorMatchingService;
import com.sentinel.vitals.entity.Vitals;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuditTrailService auditService;
    private final DoctorMatchingService doctorMatchingService;
    private final AppointmentWorkflowService workflowService;
    private final AppointmentMapper appointmentMapper;
    private final DiagnosisMapper diagnosisMapper;
    private final PrescriptionMapper prescriptionMapper;

    public AppointmentController(AppointmentService appointmentService,
                                  AuditTrailService auditService,
                                  DoctorMatchingService doctorMatchingService,
                                  AppointmentWorkflowService workflowService,
                                  AppointmentMapper appointmentMapper,
                                  DiagnosisMapper diagnosisMapper,
                                  PrescriptionMapper prescriptionMapper) {
        this.appointmentService = appointmentService;
        this.auditService = auditService;
        this.doctorMatchingService = doctorMatchingService;
        this.workflowService = workflowService;
        this.appointmentMapper = appointmentMapper;
        this.diagnosisMapper = diagnosisMapper;
        this.prescriptionMapper = prescriptionMapper;
    }

    @GetMapping("/recommended-doctors")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<DoctorRecommendationDTO> getRecommendedDoctors(
            @RequestParam(value = "patientId", required = false) Long patientId,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestParam(value = "date", required = false) String date,
            Authentication auth) {
        auditService.logAction(auth, "READ", "DOCTOR_MATCHING", patientId != null ? String.valueOf(patientId) : null,
                "Queried doctor recommendation matching engine for reason: " + reason);
        return doctorMatchingService.recommendDoctorsForPatient(patientId, reason, date);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<AppointmentResponseDTO> getAllAppointments(Authentication auth) {
        return appointmentService.getAppointmentsForUser(auth).stream()
                .map(appointmentMapper::toResponseDTO)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentById(@PathVariable Long id, Authentication auth) {
        Appointment apt = appointmentService.getAppointmentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + id + " not found"));
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(apt));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<AppointmentResponseDTO> getAppointmentsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "APPOINTMENT", String.valueOf(patientId),
                "Accessed appointment history for patient ID: " + patientId);
        return appointmentService.getAppointmentsByPatientId(patientId).stream()
                .map(appointmentMapper::toResponseDTO)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_CREATE') or hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> scheduleAppointment(
            @Valid @RequestBody AppointmentRequestDTO payload, Authentication auth) {
        Appointment entity = appointmentMapper.toEntity(payload);
        com.sentinel.patients.entity.Patient p = new com.sentinel.patients.entity.Patient();
        p.setId(payload.getPatientId());
        entity.setPatient(p);

        com.sentinel.users.entity.User d = new com.sentinel.users.entity.User();
        d.setId(payload.getDoctorId());
        entity.setDoctor(d);

        Appointment saved = appointmentService.scheduleAppointment(entity);
        auditService.logAction(auth, "CREATE", "APPOINTMENT", String.valueOf(saved.getId()),
                "Scheduled appointment for patient ID: " + saved.getPatient().getId() + " on " + saved.getAppointmentDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentMapper.toResponseDTO(saved));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateDTO payload,
            Authentication auth) {
        Appointment saved = appointmentService.updateStatus(id, payload.getStatus());
        auditService.logAction(auth, "UPDATE", "APPOINTMENT", String.valueOf(id),
                "Changed appointment ID: " + id + " status to " + payload.getStatus());
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(saved));
    }

    @PatchMapping("/{id}/stage")
    @PreAuthorize("hasAnyAuthority('APPOINTMENT_UPDATE', 'ROLE_RECEPTIONIST', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> updateAppointmentStage(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStageUpdateDTO payload,
            Authentication auth) {
        Appointment saved = appointmentService.updateAppointmentStage(id, payload.getStage());
        auditService.logAction(auth, "APPOINTMENT_STAGE_TRANSITION", "APPOINTMENT", String.valueOf(id),
                String.format("Transitioned appointment #%d stage to %s (Patient MRN: %s)",
                        id, payload.getStage(), saved.getPatient() != null ? saved.getPatient().getPatientCode() : "N/A"));
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(saved));
    }

    @GetMapping("/resources")
    @PreAuthorize("hasAnyAuthority('APPOINTMENT_READ', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMultiResourceGrid(Authentication auth) {
        return ResponseEntity.ok(appointmentService.getMultiResourceGrid());
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentResponseDTO> checkInPatient(
            @PathVariable Long id,
            @Valid @RequestBody CheckInRequestDTO payload,
            Authentication auth) {
        Appointment checkedIn = workflowService.checkInPatient(
                id,
                payload.getInsuranceVerified(),
                payload.getInsuranceDetails(),
                payload.getReportsUploaded(),
                payload.getNote(),
                auth
        );
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(checkedIn));
    }

    @PostMapping("/{id}/triage-vitals")
    @PreAuthorize("(hasAuthority('VITALS_CREATE') or hasAuthority('APPOINTMENT_UPDATE')) and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentResponseDTO> recordTriageVitals(
            @PathVariable Long id,
            @Valid @RequestBody TriageVitalsRequestDTO payload,
            Authentication auth) {
        Vitals vitals = new Vitals();
        if (payload.getSystolicBp() != null) vitals.setSystolicBp(payload.getSystolicBp());
        if (payload.getDiastolicBp() != null) vitals.setDiastolicBp(payload.getDiastolicBp());
        if (payload.getHeartRate() != null) vitals.setHeartRate(payload.getHeartRate());
        if (payload.getTemperature() != null) vitals.setTemperature(payload.getTemperature());
        if (payload.getOxygenSaturation() != null) vitals.setOxygenSaturation(payload.getOxygenSaturation());
        if (payload.getRespiratoryRate() != null) vitals.setRespiratoryRate(payload.getRespiratoryRate());
        if (payload.getWeightKg() != null) vitals.setWeightKg(payload.getWeightKg());
        if (payload.getHeightCm() != null) vitals.setHeightCm(payload.getHeightCm());
        if (payload.getBloodGlucose() != null) vitals.setBloodGlucose(payload.getBloodGlucose());

        Appointment triaged = workflowService.recordTriageVitals(id, vitals, payload.getNursingNotes(), auth);
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(triaged));
    }

    @PostMapping("/{id}/start-consultation")
    @PreAuthorize("(hasAuthority('APPOINTMENT_UPDATE') or hasAuthority('CLINICAL_NOTE_CREATE')) and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentResponseDTO> startConsultation(@PathVariable Long id, Authentication auth) {
        Appointment updated = workflowService.startConsultation(id, auth);
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(updated));
    }

    @PostMapping("/{id}/doctor-consultation")
    @PreAuthorize("(hasAuthority('CLINICAL_NOTE_CREATE') or hasAuthority('APPOINTMENT_UPDATE')) and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentResponseDTO> recordDoctorConsultation(
            @PathVariable Long id,
            @Valid @RequestBody DoctorConsultationRequestDTO payload,
            Authentication auth) {
        LocalDateTime followUpDate = null;
        if (payload.getFollowUpDate() != null && !payload.getFollowUpDate().isEmpty()) {
            followUpDate = LocalDateTime.parse(payload.getFollowUpDate());
        }

        List<Diagnosis> diagnoses = payload.getDiagnoses() != null
                ? payload.getDiagnoses().stream().map(diagnosisMapper::toEntity).toList()
                : new ArrayList<>();
        List<Prescription> prescriptions = payload.getPrescriptions() != null
                ? payload.getPrescriptions().stream().map(prescriptionMapper::toEntity).toList()
                : new ArrayList<>();
        List<AppointmentLabOrder> labOrders = payload.getLabOrders() != null
                ? payload.getLabOrders().stream().map(appointmentMapper::toLabOrderEntity).toList()
                : new ArrayList<>();

        Appointment updated = workflowService.recordDoctorConsultation(
                id, diagnoses, prescriptions, labOrders, payload.getDoctorNotes(), followUpDate, auth);
        return ResponseEntity.ok(appointmentMapper.toResponseDTO(updated));
    }

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public List<AppointmentNoteResponseDTO> getNotesForAppointment(@PathVariable Long id) {
        return workflowService.getNotesForAppointment(id).stream()
                .map(appointmentMapper::toNoteResponseDTO)
                .toList();
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentNoteResponseDTO> addNote(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentNoteRequestDTO payload,
            Authentication auth) {
        AppointmentNote note = workflowService.addAppointmentNote(id, payload.getNoteType(), payload.getContent(), auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentMapper.toNoteResponseDTO(note));
    }

    @PatchMapping("/notes/{noteId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE')")
    public ResponseEntity<AppointmentNoteResponseDTO> editNote(
            @PathVariable Long noteId,
            @Valid @RequestBody AppointmentNoteRequestDTO payload,
            Authentication auth) {
        AppointmentNote updated = workflowService.editAppointmentNote(noteId, payload.getContent(), auth);
        return ResponseEntity.ok(appointmentMapper.toNoteResponseDTO(updated));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("(hasAuthority('APPOINTMENT_CANCEL') or hasAuthority('ROLE_PATIENT')) and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentCancellationResponseDTO> cancelAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentCancellationRequestDTO payload,
            Authentication auth) {
        AppointmentCancellation cancellation = workflowService.cancelAppointment(id, payload.getReason(), payload.getComment(), auth);
        return ResponseEntity.ok(appointmentMapper.toCancellationResponseDTO(cancellation));
    }

    @GetMapping("/{id}/cancellation")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentCancellationResponseDTO> getCancellationDetails(@PathVariable Long id) {
        Optional<AppointmentCancellation> opt = workflowService.getCancellationForAppointment(id);
        return opt.map(c -> ResponseEntity.ok(appointmentMapper.toCancellationResponseDTO(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/billing")
    @PreAuthorize("(hasAuthority('INVOICE_CREATE') or hasAuthority('APPOINTMENT_UPDATE')) and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentBillingResponseDTO> generateBilling(
            @PathVariable Long id,
            @Valid @RequestBody BillingGenerationRequestDTO payload,
            Authentication auth) {
        AppointmentBilling billing = workflowService.generateBilling(
                id,
                payload.getConsultationFee(),
                payload.getTriageFee(),
                payload.getLabFee(),
                payload.getPharmacyFee(),
                payload.getInsuranceCoverage(),
                auth
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentMapper.toBillingResponseDTO(billing));
    }

    @GetMapping("/{id}/billing")
    @PreAuthorize("hasAuthority('INVOICE_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentBillingResponseDTO> getBilling(@PathVariable Long id) {
        Optional<AppointmentBilling> opt = workflowService.getBillingForAppointment(id);
        return opt.map(b -> ResponseEntity.ok(appointmentMapper.toBillingResponseDTO(b)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lab-orders")
    @PreAuthorize("hasAuthority('LAB_RESULT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public List<AppointmentLabOrderDTO> getLabOrders(@PathVariable Long id) {
        return workflowService.getLabOrdersForAppointment(id).stream()
                .map(appointmentMapper::toLabOrderDTO)
                .toList();
    }
}
