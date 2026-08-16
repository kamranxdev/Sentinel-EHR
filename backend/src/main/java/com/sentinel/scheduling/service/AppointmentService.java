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
import com.sentinel.tenancy.entity.Facility;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.FacilityRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final FacilityRepository facilityRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              UserRepository userRepository,
                              OrganizationRepository organizationRepository,
                              FacilityRepository facilityRepository,
                              DepartmentRepository departmentRepository,
                              AuditService auditService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.facilityRepository = facilityRepository;
        this.departmentRepository = departmentRepository;
        this.auditService = auditService;
    }

    public AppointmentResponseDTO createAppointment(CreateAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setStartsAt(request.getStartsAt());
        appt.setEndsAt(request.getEndsAt() != null ? request.getEndsAt() : request.getStartsAt().plusMinutes(30));
        appt.setReason(request.getReason());
        appt.setNotes(request.getNotes());
        appt.setStatus("SCHEDULED");
        appt.setStage("SCHEDULED");
        appt.setCreatedAt(OffsetDateTime.now());
        appt.setUpdatedAt(OffsetDateTime.now());

        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(appt::setOrganization);
        }
        if (request.getFacilityId() != null) {
            facilityRepository.findById(request.getFacilityId()).ifPresent(appt::setFacility);
        }
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(appt::setDepartment);
        }
        if (request.getPractitionerId() != null) {
            userRepository.findById(request.getPractitionerId()).ifPresent(appt::setCreatedBy);
        }

        Appointment saved = appointmentRepository.save(appt);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "APPOINTMENT_SCHEDULED", "Appointment scheduled for patient " + patient.getId());
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
    public List<AppointmentResponseDTO> getFacilityAppointments(UUID facilityId) {
        return appointmentRepository.findByFacilityIdOrderByStartsAtDesc(facilityId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDTO updateAppointment(UUID appointmentId, UpdateAppointmentRequest request) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (request.getStatus() != null) {
            appt.setStatus(request.getStatus());
            appt.setStage(request.getStatus());
        }
        if (request.getReason() != null) appt.setReason(request.getReason());
        if (request.getNotes() != null) appt.setNotes(request.getNotes());
        if (request.getStartsAt() != null) appt.setStartsAt(request.getStartsAt());
        if (request.getEndsAt() != null) appt.setEndsAt(request.getEndsAt());
        if (request.getPractitionerId() != null) {
            userRepository.findById(request.getPractitionerId()).ifPresent(appt::setCreatedBy);
        }
        appt.setUpdatedAt(OffsetDateTime.now());

        Appointment saved = appointmentRepository.save(appt);
        return mapToDTO(saved);
    }

    public AppointmentResponseDTO mapToDTO(Appointment a) {
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
