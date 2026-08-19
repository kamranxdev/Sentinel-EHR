package com.sentinel.security.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.security.dto.BreakGlassRequestDTO;
import com.sentinel.security.dto.BreakGlassResponseDTO;
import com.sentinel.security.entity.BreakGlassRecord;
import com.sentinel.security.repository.BreakGlassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BreakGlassService {

    private final BreakGlassRepository breakGlassRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public BreakGlassService(BreakGlassRepository breakGlassRepository,
                             PatientRepository patientRepository,
                             UserRepository userRepository,
                             AuditService auditService) {
        this.breakGlassRepository = breakGlassRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public BreakGlassResponseDTO requestEmergencyAccess(BreakGlassRequestDTO request, String clientIp) {
        if (request.getJustification() == null || request.getJustification().trim().length() < 10) {
            throw new IllegalArgumentException("Emergency Break-Glass justification must be provided and contain at least 10 characters.");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + request.getPatientId() + " not found"));

        User user = null;
        if (request.getEmail() != null) {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User with email " + request.getEmail() + " not found"));
        } else {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) user = users.get(0);
        }

        BreakGlassRecord record = new BreakGlassRecord(
                patient,
                user,
                request.getCategory() != null ? request.getCategory() : "CROSS_COVERAGE_EMERGENCY",
                request.getJustification(),
                clientIp != null ? clientIp : "127.0.0.1"
        );
        BreakGlassRecord saved = breakGlassRepository.save(record);

        if (auditService != null) {
            auditService.logEvent(
                    patient.getId(),
                    "EMERGENCY_BREAK_GLASS",
                    "EMERGENCY BREAK-GLASS OVERRIDE INITIATED! Category: " + saved.getCategory() + " | Justification: " + request.getJustification()
            );
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BreakGlassResponseDTO> getAllRecords() {
        return breakGlassRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BreakGlassResponseDTO getRecord(Long id) {
        BreakGlassRecord record = breakGlassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Break glass record not found with id: " + id));
        return mapToDTO(record);
    }

    public BreakGlassResponseDTO revokeRecord(Long id) {
        BreakGlassRecord record = breakGlassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Break glass record not found with id: " + id));

        record.setStatus("REVOKED");
        BreakGlassRecord saved = breakGlassRepository.save(record);

        if (auditService != null) {
            auditService.logEvent(saved.getPatient().getId(), "BREAK_GLASS_REVOKED", "Revoked break-glass session " + id);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public boolean hasActiveBreakGlassOverride(UUID patientId, String email) {
        return userRepository.findByEmail(email)
                .map(user -> hasActiveBreakGlass(user.getId(), patientId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean hasActiveBreakGlass(UUID userId, UUID patientId) {
        return breakGlassRepository.findByPatientIdOrderByRequestedAtDesc(patientId)
                .stream()
                .anyMatch(rec -> rec.getUser() != null && rec.getUser().getId().equals(userId) && "ACTIVE".equalsIgnoreCase(rec.getStatus()));
    }

    @Transactional(readOnly = true)
    public List<BreakGlassRecord> getRecordsByPatient(UUID patientId) {
        return breakGlassRepository.findByPatientIdOrderByRequestedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<BreakGlassRecord> getRecordsByUser(String email) {
        return breakGlassRepository.findByUserEmailOrderByRequestedAtDesc(email);
    }

    public BreakGlassResponseDTO mapToDTO(BreakGlassRecord r) {
        BreakGlassResponseDTO dto = new BreakGlassResponseDTO();
        dto.setId(r.getId());
        if (r.getPatient() != null) {
            dto.setPatientId(r.getPatient().getId());
            dto.setPatientName(r.getPatient().getFullName());
        }
        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getId());
            dto.setEmail(r.getUser().getEmail());
        }
        dto.setCategory(r.getCategory());
        dto.setJustification(r.getJustification());
        dto.setRequestedAt(r.getRequestedAt());
        dto.setExpiresAt(r.getExpiresAt());
        dto.setStatus(r.getStatus());
        dto.setClientIp(r.getClientIp());
        return dto;
    }
}
