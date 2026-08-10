package com.sentinel.appointments.controller;

import com.sentinel.appointments.dto.*;
import com.sentinel.appointments.entity.*;
import com.sentinel.appointments.repository.AppointmentRepository;
import com.sentinel.appointments.service.AppointmentWorkflowService;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.users.dto.DoctorRecommendationDTO;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.users.service.DoctorMatchingService;
import com.sentinel.vitals.entity.Vitals;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/appointments", "/api/appointments"})
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditService;
    private final DoctorMatchingService doctorMatchingService;
    private final AppointmentWorkflowService workflowService;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository,
                                  AuditTrailService auditService,
                                  DoctorMatchingService doctorMatchingService,
                                  AppointmentWorkflowService workflowService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.doctorMatchingService = doctorMatchingService;
        this.workflowService = workflowService;
    }

    @GetMapping("/recommended-doctors")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<DoctorRecommendationDTO> getRecommendedDoctors(@RequestParam(value = "patientId", required = false) Long patientId,
                                                                @RequestParam(value = "reason", required = false) String reason,
                                                                Authentication auth) {
        auditService.logAction(auth, "READ", "DOCTOR_MATCHING", patientId != null ? String.valueOf(patientId) : null, "Queried AI doctor recommendation matching engine for reason: " + reason);
        return doctorMatchingService.recommendDoctorsForPatient(patientId, reason);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public List<Appointment> getAllAppointments(Authentication auth) {
        boolean isPatientOnly = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_PATIENT")) &&
                auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .noneMatch(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_DOCTOR") || r.equals("ROLE_NURSE") || r.equals("ROLE_RECEPTIONIST") || r.equals("ROLE_AUDITOR"));

        if (isPatientOnly) {
            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isPresent()) {
                Optional<Patient> patientOpt = patientRepository.findByUserId(userOpt.get().getId());
                if (patientOpt.isPresent()) {
                    return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientOpt.get().getId());
                }
            }
            return Collections.emptyList();
        }

        return appointmentRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id, Authentication auth) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + id + " not found"));
        return ResponseEntity.ok(apt);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId, Authentication auth) {
        auditService.logAction(auth, "READ", "APPOINTMENT", String.valueOf(patientId), "Accessed appointment history for patient ID: " + patientId);
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_CREATE') or hasRole('PATIENT')")
    public ResponseEntity<Appointment> scheduleAppointment(@RequestBody Appointment appointment, Authentication auth) {
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            throw new IllegalArgumentException("Patient ID must be provided");
        }
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            throw new IllegalArgumentException("Doctor ID must be provided");
        }

        Patient patient = patientRepository.findById(appointment.getPatient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + appointment.getPatient().getId() + " not found"));
        User doctor = userRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + appointment.getDoctor().getId() + " not found"));

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        if (appointment.getStage() == null) {
            appointment.setStage("SCHEDULED");
        }

        Appointment saved = appointmentRepository.save(appointment);
        auditService.logAction(auth, "CREATE", "APPOINTMENT", String.valueOf(saved.getId()), "Scheduled appointment for patient ID: " + patient.getId() + " on " + saved.getAppointmentDate());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + id + " not found"));

        apt.setStatus(status);
        apt.setStage(status);
        Appointment saved = appointmentRepository.save(apt);
        auditService.logAction(auth, "UPDATE", "APPOINTMENT", String.valueOf(id), "Changed appointment ID: " + id + " status to " + status);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/stage")
    @PreAuthorize("hasAnyAuthority('APPOINTMENT_UPDATE', 'ROLE_RECEPTIONIST', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<Appointment> updateAppointmentStage(@PathVariable Long id,
                                                                @RequestParam String stage,
                                                                Authentication auth) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + id + " not found"));

        String oldStage = apt.getStage() != null ? apt.getStage() : "SCHEDULED";
        apt.setStage(stage);
        apt.setStatus(stage);

        if ("ARRIVED".equalsIgnoreCase(stage) || "CHECKED_IN".equalsIgnoreCase(stage)) {
            if (apt.getArrivedAt() == null) {
                apt.setArrivedAt(LocalDateTime.now());
            }
        }

        Appointment saved = appointmentRepository.save(apt);
        auditService.logAction(auth, "APPOINTMENT_STAGE_TRANSITION", "APPOINTMENT", String.valueOf(id),
                String.format("Transitioned appointment #%d stage: %s -> %s (Patient MRN: %s)",
                        id, oldStage, stage, apt.getPatient() != null ? apt.getPatient().getPatientCode() : "N/A"));

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/resources")
    @PreAuthorize("hasAnyAuthority('APPOINTMENT_READ', 'ROLE_RECEPTIONIST', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMultiResourceGrid(Authentication auth) {
        List<Appointment> allApts = appointmentRepository.findAll();
        
        List<Map<String, String>> rooms = List.of(
            Map.of("id", "ROOM-101", "name", "Exam Room 1 - General Clinic", "type", "Consultation"),
            Map.of("id", "ROOM-102", "name", "Exam Room 2 - Cardiology", "type", "Echocardiography"),
            Map.of("id", "ROOM-103", "name", "Exam Room 3 - Urgent Care & Triage", "type", "Triage"),
            Map.of("id", "ROOM-104", "name", "Procedure Suite A", "type", "Minor Surgery")
        );

        Map<String, Object> grid = new HashMap<>();
        grid.put("appointments", allApts);
        grid.put("rooms", rooms);
        grid.put("facility", "Central Healthcare Medical Center - Main Clinic");
        
        return ResponseEntity.ok(grid);
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> checkInPatient(@PathVariable Long id,
                                                        @RequestBody CheckInRequestDTO payload,
                                                        Authentication auth) {
        Appointment checkedIn = workflowService.checkInPatient(
                id, 
                payload.getInsuranceVerified(), 
                payload.getInsuranceDetails(), 
                payload.getReportsUploaded(), 
                payload.getNote(), 
                auth
        );
        return ResponseEntity.ok(checkedIn);
    }

    @PostMapping("/{id}/triage-vitals")
    @PreAuthorize("hasAuthority('VITALS_CREATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> recordTriageVitals(@PathVariable Long id,
                                                           @RequestBody TriageVitalsRequestDTO payload,
                                                           Authentication auth) {
        Vitals vitals = new Vitals();
        if (payload.getBloodPressure() != null) vitals.setBloodPressure(payload.getBloodPressure());
        if (payload.getHeartRate() != null) vitals.setHeartRate(payload.getHeartRate());
        if (payload.getTemperature() != null) vitals.setTemperature(payload.getTemperature());
        if (payload.getOxygenSaturation() != null) vitals.setOxygenSaturation(payload.getOxygenSaturation());
        if (payload.getRespiratoryRate() != null) vitals.setRespiratoryRate(payload.getRespiratoryRate());
        if (payload.getWeightKg() != null) vitals.setWeightKg(payload.getWeightKg());
        if (payload.getHeightCm() != null) vitals.setHeightCm(payload.getHeightCm());
        if (payload.getBloodGlucose() != null) vitals.setBloodGlucose(payload.getBloodGlucose());

        Appointment triaged = workflowService.recordTriageVitals(id, vitals, payload.getNursingNotes(), auth);
        return ResponseEntity.ok(triaged);
    }

    @PostMapping("/{id}/doctor-consultation")
    @PreAuthorize("hasAuthority('CLINICAL_NOTE_CREATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<Appointment> recordDoctorConsultation(@PathVariable Long id,
                                                                 @RequestBody DoctorConsultationRequestDTO payload,
                                                                 Authentication auth) {
        LocalDateTime followUpDate = null;
        if (payload.getFollowUpDate() != null && !payload.getFollowUpDate().isEmpty()) {
            followUpDate = LocalDateTime.parse(payload.getFollowUpDate());
        }

        List<Diagnosis> diagnoses = payload.getDiagnoses() != null ? payload.getDiagnoses() : new ArrayList<>();
        List<Prescription> prescriptions = payload.getPrescriptions() != null ? payload.getPrescriptions() : new ArrayList<>();
        List<AppointmentLabOrder> labOrders = payload.getLabOrders() != null ? payload.getLabOrders() : new ArrayList<>();

        Appointment updated = workflowService.recordDoctorConsultation(
                id, 
                diagnoses, 
                prescriptions, 
                labOrders, 
                payload.getDoctorNotes(), 
                followUpDate, 
                auth
        );
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public List<AppointmentNote> getNotesForAppointment(@PathVariable Long id) {
        return workflowService.getNotesForAppointment(id);
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentNote> addNote(@PathVariable Long id,
                                                    @RequestBody AppointmentNoteRequestDTO payload,
                                                    Authentication auth) {
        AppointmentNote note = workflowService.addAppointmentNote(id, payload.getNoteType(), payload.getContent(), auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @PutMapping("/notes/{noteId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public ResponseEntity<AppointmentNote> editNote(@PathVariable Long noteId,
                                                     @RequestBody AppointmentNoteRequestDTO payload,
                                                     Authentication auth) {
        AppointmentNote updated = workflowService.editAppointmentNote(noteId, payload.getContent(), auth);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("(hasAuthority('APPOINTMENT_CANCEL') or hasRole('PATIENT')) and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentCancellation> cancelAppointment(@PathVariable Long id,
                                                                      @RequestBody AppointmentCancellationRequestDTO payload,
                                                                      Authentication auth) {
        AppointmentCancellation cancellation = workflowService.cancelAppointment(id, payload.getReason(), payload.getComment(), auth);
        return ResponseEntity.ok(cancellation);
    }

    @GetMapping("/{id}/cancellation")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentCancellation> getCancellationDetails(@PathVariable Long id) {
        Optional<AppointmentCancellation> opt = workflowService.getCancellationForAppointment(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/billing")
    @PreAuthorize("hasAuthority('INVOICE_CREATE') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentBilling> generateBilling(@PathVariable Long id,
                                                               @RequestBody BillingGenerationRequestDTO payload,
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
        return ResponseEntity.status(HttpStatus.CREATED).body(billing);
    }

    @GetMapping("/{id}/billing")
    @PreAuthorize("hasAuthority('INVOICE_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public ResponseEntity<AppointmentBilling> getBilling(@PathVariable Long id) {
        Optional<AppointmentBilling> opt = workflowService.getBillingForAppointment(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lab-orders")
    @PreAuthorize("hasAuthority('LAB_RESULT_READ') and @patientSecurityService.canAccessAppointment(authentication, #id)")
    public List<AppointmentLabOrder> getLabOrders(@PathVariable Long id) {
        return workflowService.getLabOrdersForAppointment(id);
    }
}
