package com.sentinel.authorization.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.authorization.entity.BreakGlassRecord;
import com.sentinel.authorization.repository.BreakGlassRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BreakGlassService {

    private final BreakGlassRepository breakGlassRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditTrailService auditTrailService;

    public BreakGlassService(BreakGlassRepository breakGlassRepository,
                             PatientRepository patientRepository,
                             UserRepository userRepository,
                             AuditTrailService auditTrailService) {
        this.breakGlassRepository = breakGlassRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditTrailService = auditTrailService;
    }

    @Transactional
    public BreakGlassRecord requestEmergencyAccess(Long patientId, String username, String category, String justification, String clientIp) {
        if (justification == null || justification.trim().length() < 10) {
            throw new IllegalArgumentException("Emergency Break-Glass justification must be provided and contain at least 10 characters.");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + patientId + " not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User with username " + username + " not found"));

        BreakGlassRecord record = new BreakGlassRecord(patient, user, category != null ? category : "CROSS_COVERAGE_EMERGENCY", justification, clientIp != null ? clientIp : "127.0.0.1");
        BreakGlassRecord saved = breakGlassRepository.save(record);

        // Generate WORM Audit Log Record
        auditTrailService.logAction(
            username,
            "EMERGENCY_BREAK_GLASS",
            "PATIENT",
            patientId.toString(),
            "EMERGENCY BREAK-GLASS OVERRIDE INITIATED! Category: " + saved.getCategory() + " | Justification: " + justification + " | Granted 4-hour emergency lease until " + saved.getExpiresAt()
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public boolean hasActiveBreakGlassOverride(Long patientId, String username) {
        if (patientId == null || username == null) return false;
        Optional<BreakGlassRecord> overrideOpt = breakGlassRepository.findActiveOverride(patientId, username, LocalDateTime.now());
        return overrideOpt.isPresent();
    }

    @Transactional(readOnly = true)
    public List<BreakGlassRecord> getRecordsByPatient(Long patientId) {
        return breakGlassRepository.findByPatientIdOrderByRequestedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<BreakGlassRecord> getRecordsByUser(String username) {
        return breakGlassRepository.findByUserUsernameOrderByRequestedAtDesc(username);
    }
}
