package com.sentinel.scheduling.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.scheduling.dto.AppointmentResponseDTO;
import com.sentinel.scheduling.dto.CreateAppointmentRequest;
import com.sentinel.scheduling.dto.UpdateAppointmentRequest;
import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import com.sentinel.security.TenantContext;
import com.sentinel.common.exception.AccessDeniedCustomException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sentinel.identity.entity.UserOrganization;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.UserOrganizationRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PractitionerRepository practitionerRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;
    private final com.sentinel.clinical.repository.VitalsRepository vitalsRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            PractitionerRepository practitionerRepository,
            UserOrganizationRepository userOrganizationRepository,
            OrganizationRepository organizationRepository,
            DepartmentRepository departmentRepository,
            AuditService auditService,
            com.sentinel.clinical.repository.VitalsRepository vitalsRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.practitionerRepository = practitionerRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.auditService = auditService;
        this.vitalsRepository = vitalsRepository;
    }


    public AppointmentResponseDTO createAppointment(CreateAppointmentRequest request) {
        UUID currentOrganizationId = requireCurrentOrganization();
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setStartsAt(request.getStartsAt());
        appt.setEndsAt(request.getEndsAt() != null ? request.getEndsAt() : request.getStartsAt().plusMinutes(30));
        appt.setReason(request.getReason());
        appt.setNotes(request.getNotes());
        appt.setStatus("SCHEDULED");
        appt.setSchedulingMode(request.getSchedulingMode() != null ? request.getSchedulingMode() : "SPECIFIC_DOCTOR");
        appt.setSpecialtyCode(request.getSpecialtyCode());
        appt.setEncounterType(request.getEncounterType() != null ? request.getEncounterType() : "OUTPATIENT");
        appt.setCreatedAt(OffsetDateTime.now());
        appt.setUpdatedAt(OffsetDateTime.now());

        // Resolve Doctor User
        if (request.getPractitionerId() != null) {
            Optional<User> doctorUser = userRepository.findById(request.getPractitionerId());
            if (doctorUser.isEmpty()) {
                doctorUser = practitionerRepository.findById(request.getPractitionerId())
                        .filter(p -> p.getPerson() != null)
                        .flatMap(p -> userRepository.findByPersonId(p.getPerson().getId()));
            }
            doctorUser.ifPresent(u -> {
                appt.setPractitioner(u);
                appt.setCreatedBy(u);
            });
        }

        if (request.getOrganizationId() != null && !currentOrganizationId.equals(request.getOrganizationId())) {
            throw new AccessDeniedCustomException("Appointments must be created in the active organization context");
        }
        appt.setOrganization(organizationRepository.findById(currentOrganizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Active organization not found")));
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(appt::setDepartment);
        }

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_SCHEDULED",
                    "Appointment scheduled for patient " + patient.getId());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointment(UUID appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        return mapToDTO(appt);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPatientAppointments(UUID patientId) {
        return appointmentRepository.findByPatientIdOrderByStartsAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getOrganizationAppointments(UUID organizationId) {
        return appointmentRepository.findByOrganizationIdOrderByStartsAtDesc(organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPhysicianOrganizationAppointments(UUID practitionerId, UUID organizationId) {
        UUID physicianUserId = resolvePhysicianUserId(practitionerId);
        return appointmentRepository.findByPractitionerIdAndOrganizationIdOrderByStartsAtDesc(physicianUserId, organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPractitionerAppointments(UUID practitionerId) {
        UUID physicianUserId = resolvePhysicianUserId(practitionerId);
        return appointmentRepository.findByPractitionerIdOrderByStartsAtDesc(physicianUserId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UUID resolvePhysicianUserId(UUID practitionerId) {
        if (practitionerId == null) {
            return null;
        }
        if (userRepository.existsById(practitionerId)) {
            return practitionerId;
        }
        return practitionerRepository.findById(practitionerId)
                .filter(p -> p.getPerson() != null)
                .flatMap(p -> userRepository.findByPersonId(p.getPerson().getId()))
                .map(User::getId)
                .orElse(practitionerId);
    }

    public AppointmentResponseDTO updateAppointment(UUID appointmentId, UpdateAppointmentRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        assertCurrentOrganization(appt);

        if (request.getStatus() != null) {
            transitionStatus(appt, request.getStatus());
        }
        if (request.getReason() != null)
            appt.setReason(request.getReason());
        if (request.getNotes() != null)
            appt.setNotes(request.getNotes());
        if (request.getStartsAt() != null)
            appt.setStartsAt(request.getStartsAt());
        if (request.getEndsAt() != null)
            appt.setEndsAt(request.getEndsAt());
        if (request.getPractitionerId() != null) {
            userRepository.findById(request.getPractitionerId()).ifPresent(u -> {
                appt.setPractitioner(u);
                appt.setCreatedBy(u);
            });
        }
        appt.setUpdatedAt(OffsetDateTime.now());

        Appointment saved = appointmentRepository.save(appt);
        return mapToDTO(saved);
    }

    private UUID requireCurrentOrganization() {
        UUID organizationId = TenantContext.getCurrentOrganizationId();
        if (organizationId == null) {
            throw new AccessDeniedCustomException("An active organization context is required");
        }
        return organizationId;
    }

    private void assertCurrentOrganization(Appointment appointment) {
        UUID currentOrganizationId = TenantContext.getCurrentOrganizationId();
        if (currentOrganizationId != null && appointment.getOrganization() != null) {
            if (!currentOrganizationId.equals(appointment.getOrganization().getId())) {
                throw new AccessDeniedCustomException("You cannot access an appointment from another organization");
            }
        }
    }

    private void transitionStatus(Appointment appointment, String requestedStatus) {
        String current = appointment.getStatus();
        String next = requestedStatus.trim().toUpperCase();
        if (next.equals(current)) return;
        Map<String, Set<String>> transitions = Map.of(
                "SCHEDULED", Set.of("CONFIRMED", "ARRIVED", "CHECKED_IN", "CANCELLED", "NO_SHOW"),
                "CONFIRMED", Set.of("ARRIVED", "CHECKED_IN", "CANCELLED", "NO_SHOW"),
                "ARRIVED", Set.of("CHECKED_IN", "CANCELLED", "NO_SHOW"),
                "CHECKED_IN", Set.of("TRIAGED", "IN_CONSULTATION", "CANCELLED", "NO_SHOW"),
                "TRIAGED", Set.of("IN_CONSULTATION", "COMPLETED", "CANCELLED"),
                "IN_CONSULTATION", Set.of("COMPLETED", "CANCELLED"));
        if (!transitions.getOrDefault(current, Set.of()).contains(next)) {
            // If already in terminal or special state, allow idempotent or admin updates
            if (!"COMPLETED".equals(current) && !"CANCELLED".equals(current)) {
                appointment.setStatus(next);
            } else {
                throw new IllegalStateException("Cannot transition appointment from " + current + " to " + next);
            }
        } else {
            appointment.setStatus(next);
        }
        OffsetDateTime now = OffsetDateTime.now();
        if ("ARRIVED".equals(next)) appointment.setArrivedAt(now);
        if ("CHECKED_IN".equals(next)) appointment.setCheckedInAt(now);
        if ("NO_SHOW".equals(next)) appointment.setNoShowAt(now);
        if ("COMPLETED".equals(next)) appointment.setCompletedAt(now);
    }


    public AppointmentResponseDTO mapToDTO(Appointment a) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(a.getId());
        if (a.getOrganization() != null)
            dto.setOrganizationId(a.getOrganization().getId());
        if (a.getDepartment() != null)
            dto.setDepartmentId(a.getDepartment().getId());
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getFullName());
            vitalsRepository.findTopByPatientIdOrderByRecordedAtDesc(a.getPatient().getId())
                    .ifPresent(v -> dto.setVitals(mapVitalsToDTO(v)));
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

    private com.sentinel.clinical.dto.VitalsResponseDTO mapVitalsToDTO(com.sentinel.clinical.entity.Vitals v) {
        if (v == null) return null;
        com.sentinel.clinical.dto.VitalsResponseDTO dto = new com.sentinel.clinical.dto.VitalsResponseDTO();
        dto.setId(v.getId());
        if (v.getPatient() != null) dto.setPatientId(v.getPatient().getId());
        if (v.getEncounter() != null) dto.setEncounterId(v.getEncounter().getId());
        dto.setSystolicBp(v.getSystolicBp());
        dto.setDiastolicBp(v.getDiastolicBp());
        dto.setMeanArterialPressure(v.getMeanArterialPressure());
        dto.setHeartRate(v.getHeartRate());
        dto.setRespiratoryRate(v.getRespiratoryRate());
        dto.setTemperature(v.getTemperature());
        dto.setTemperatureUnit(v.getTemperatureUnit());
        dto.setOxygenSaturation(v.getOxygenSaturation());
        dto.setHeightCm(v.getHeightCm());
        dto.setWeightKg(v.getWeightKg());
        dto.setBmi(v.getBmi());
        dto.setBloodGlucose(v.getBloodGlucose());
        dto.setGlucoseUnit(v.getGlucoseUnit());
        dto.setPainScore(v.getPainScore());
        dto.setNotes(v.getNotes());
        dto.setRecordedAt(v.getRecordedAt());
        return dto;
    }
}

