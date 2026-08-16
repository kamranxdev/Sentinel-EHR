package com.sentinel.security.abac;

import com.sentinel.security.evaluator.ABACEvaluator;
import com.sentinel.security.service.BreakGlassService;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.security.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component("abacEvaluator")
public class AbacSecurityEvaluator implements ABACEvaluator {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final BreakGlassService breakGlassService;

    public AbacSecurityEvaluator(UserRepository userRepository,
                                 PatientRepository patientRepository,
                                 BreakGlassService breakGlassService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.breakGlassService = breakGlassService;
    }

    @Override
    public boolean canAccessPatientData(Authentication authentication, UUID patientId, String action) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // Path 1: System Admin / Org Admin / Auditor / Physician override
        if (roles.contains("SUPER_ADMIN") || roles.contains("ORGANIZATION_ADMIN") || roles.contains("AUDITOR") ||
            roles.contains("PHYSICIAN")) {
            return true;
        }

        // Path 2: Active Treatment Relationship / Assignment
        if (hasTreatmentRelationship(authentication, patientId)) {
            return true;
        }

        // Path 3: Active Emergency Break-Glass Access
        return userRepository.findByUsername(authentication.getName())
                .map(user -> breakGlassService.hasActiveBreakGlass(user.getId(), patientId))
                .orElse(false);
    }

    @Override
    public boolean hasTreatmentRelationship(Authentication authentication, UUID patientId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        boolean isAdminOrAuditor = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("SUPER_ADMIN") || a.equals("ORGANIZATION_ADMIN") || a.equals("AUDITOR"));
        if (isAdminOrAuditor) {
            return true;
        }
        return patientRepository.existsById(patientId);
    }

    @Override
    public boolean isSelf(Authentication authentication, UUID userId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return userRepository.findByUsername(authentication.getName())
                .map(u -> u.getId().equals(userId))
                .orElse(false);
    }

    @Override
    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(permissionCode) || a.equals("SUPER_ADMIN") || a.equals("ORGANIZATION_ADMIN"));
    }
}
