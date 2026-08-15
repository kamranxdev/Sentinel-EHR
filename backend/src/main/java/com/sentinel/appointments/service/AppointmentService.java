package com.sentinel.appointments.service;

import com.sentinel.appointments.entity.Appointment;
import com.sentinel.appointments.repository.AppointmentRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsForUser(Authentication auth) {
        boolean isPatientOnly = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_PATIENT")) &&
                auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .noneMatch(r -> r.equals("ROLE_SYS_ADMIN") || r.equals("ROLE_ORG_ADMIN") || r.equals("ROLE_DOCTOR") || r.equals("ROLE_NURSE") || r.equals("ROLE_RECEPTIONIST") || r.equals("ROLE_AUDITOR"));

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

    @Transactional(readOnly = true)
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId);
    }

    @Transactional
    public Appointment scheduleAppointment(Appointment appointment) {
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

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateStatus(Long id, String status) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + id + " not found"));
        apt.setStatus(status);
        apt.setStage(status);
        return appointmentRepository.save(apt);
    }

    @Transactional
    public Appointment updateAppointmentStage(Long id, String stage) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + id + " not found"));

        apt.setStage(stage);
        apt.setStatus(stage);

        if ("ARRIVED".equalsIgnoreCase(stage) || "CHECKED_IN".equalsIgnoreCase(stage)) {
            if (apt.getArrivedAt() == null) {
                apt.setArrivedAt(LocalDateTime.now());
            }
        }

        return appointmentRepository.save(apt);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMultiResourceGrid() {
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
        
        return grid;
    }
}

