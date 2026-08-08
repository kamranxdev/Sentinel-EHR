package com.medvault.authorization.evaluator;

import org.springframework.security.core.Authentication;

public interface ABACEvaluator {
    boolean canAccessPatientData(Authentication authentication, Long patientId, String action);
    boolean hasTreatmentRelationship(Authentication authentication, Long patientId);
    boolean isSelf(Authentication authentication, Long userId);
    boolean hasPermission(Authentication authentication, String permissionCode);
}
