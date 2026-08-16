package com.sentinel.scheduling.service;

import com.sentinel.scheduling.entity.*;
import com.sentinel.scheduling.repository.*;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AppointmentWorkflowService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditService;

    public AppointmentWorkflowService(AppointmentRepository appointmentRepository,
                                       UserRepository userRepository,
                                       AuditTrailService auditService) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Appointment checkInPatient(UUID appointmentId, String note, Authentication auth) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment #" + appointmentId + " not found"));

        apt.setStatus("CHECKED_IN");
        apt.setStage("CHECKED_IN");
        if (note != null) {
            apt.setNotes(note);
        }

        Appointment saved = appointmentRepository.save(apt);
        auditService.logAction(auth, "CHECK_IN", "APPOINTMENT", String.valueOf(appointmentId), "Patient checked in");
        return saved;
    }
}
