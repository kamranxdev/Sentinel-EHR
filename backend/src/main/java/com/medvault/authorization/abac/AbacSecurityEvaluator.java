package com.medvault.authorization.abac;

import com.medvault.authorization.evaluator.ABACEvaluator;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientAssignmentRepository;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.users.entity.User;
import com.medvault.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("abacEvaluator")
public class AbacSecurityEvaluator implements ABACEvaluator {

    private final PatientAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public AbacSecurityEvaluator(PatientAssignmentRepository assignmentRepository,
                                UserRepository userRepository,
                                PatientRepository patientRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
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

        if (hasRole(authentication, "ROLE_SYS_ADMIN") || hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ROLE_AUDITOR")) {
            return true;
        }

        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isPresent() && patientOpt.get().getUser() != null) {
            if (patientOpt.get().getUser().getUsername().equalsIgnoreCase(username)) {
                return true;
            }
        }

        boolean hasAssignment = assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(patientId, username);
        if (hasAssignment) {
            return true;
        }

        Optional<User> currentUserOpt = userRepository.findByUsername(username);
        if (currentUserOpt.isPresent() && patientOpt.isPresent()) {
            User currentUser = currentUserOpt.get();
            Patient patient = patientOpt.get();

            if (currentUser.getDepartment() != null && currentUser.getDepartment().equalsIgnoreCase(patient.getDepartment())) {
                return true;
            }
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
