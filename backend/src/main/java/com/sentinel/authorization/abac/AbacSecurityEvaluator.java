package com.sentinel.authorization.abac;

import com.sentinel.authorization.evaluator.ABACEvaluator;
import com.sentinel.authorization.service.BreakGlassService;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientAssignmentRepository;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("abacEvaluator")
public class AbacSecurityEvaluator implements ABACEvaluator {

    private final PatientAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final BreakGlassService breakGlassService;

    public AbacSecurityEvaluator(PatientAssignmentRepository assignmentRepository,
                                UserRepository userRepository,
                                PatientRepository patientRepository,
                                BreakGlassService breakGlassService) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.breakGlassService = breakGlassService;
    }

    @Override
    public boolean canAccessPatientData(Authentication authentication, Long patientId, String action) {
        return hasTreatmentRelationship(authentication, patientId);
    }

    @Override
    public boolean hasTreatmentRelationship(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();

        if (hasRole(authentication, "ROLE_SYS_ADMIN") || hasRole(authentication, "ROLE_ADMIN") ||
            hasRole(authentication, "ROLE_AUDITOR") || hasRole(authentication, "ROLE_DOCTOR") ||
            hasRole(authentication, "ROLE_NURSE") || hasRole(authentication, "ROLE_RECEPTIONIST")) {
            return true;
        }

        // Patient self-service: verify they are accessing their own record
        if (hasRole(authentication, "ROLE_PATIENT")) {
            Optional<Patient> selfPatient = patientRepository.findFirstByUser_Username(username);
            if (selfPatient.isPresent() && selfPatient.get().getId().equals(patientId)) {
                return true;
            }
            // Fallback: check via linked user entity on the patient record
            Optional<Patient> patientOpt2 = patientRepository.findById(patientId);
            if (patientOpt2.isPresent() && patientOpt2.get().getUser() != null) {
                return patientOpt2.get().getUser().getUsername().equalsIgnoreCase(username);
            }
            return false;
        }

        // 1. Check Self-Service patient profile access (for non-patient roles linked to patient records)
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isPresent() && patientOpt.get().getUser() != null) {
            if (patientOpt.get().getUser().getUsername().equalsIgnoreCase(username)) {
                return true;
            }
        }

        // 2. Check active Care Team assignment roster
        boolean hasAssignment = assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(patientId, username);
        if (hasAssignment) {
            return true;
        }

        // 5. Ward / Department match
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && patientOpt.isPresent()) {
            User clinician = userOpt.get();
            Patient p = patientOpt.get();
            if (clinician.getDepartment() != null && p.getDepartment() != null) {
                String cDept = clinician.getDepartment().trim().toLowerCase();
                String pDept = p.getDepartment().trim().toLowerCase();
                if (cDept.equals(pDept) ||
                    (cDept.contains("card") && pDept.contains("card")) ||
                    (cDept.contains("emg") && pDept.contains("emg")) ||
                    (cDept.contains("emergency") && pDept.contains("emergency"))) {
                    return true;
                }
            }
        }

        // 4. Check active Emergency Break-Glass override lease
        if (breakGlassService.hasActiveBreakGlassOverride(patientId, username)) {
            return true;
        }

        return false;
    }

    @Override
    public boolean isSelf(Authentication authentication, Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.isPresent() && userOpt.get().getUsername().equalsIgnoreCase(username);
    }

    @Override
    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(permissionCode) || auth.equals("ROLE_SYS_ADMIN") || auth.equals("ROLE_ADMIN"));
    }

    private boolean hasRole(Authentication authentication, String roleName) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(roleName));
    }
}
