package com.sentinel.security.evaluator;

import org.springframework.security.core.Authentication;
import java.util.UUID;

public interface ABACEvaluator {
    boolean canAccessPatientData(Authentication authentication, UUID patientId, String action);
    boolean hasTreatmentRelationship(Authentication authentication, UUID patientId);
    boolean isSelf(Authentication authentication, UUID userId);
    boolean hasPermission(Authentication authentication, String permissionCode);
}
