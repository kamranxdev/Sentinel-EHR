package com.sentinel.patient.service;

import com.sentinel.security.evaluator.ABACEvaluator;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service("patientSecurityService")
public class PatientSecurityService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final ABACEvaluator abacEvaluator;

    public PatientSecurityService(UserRepository userRepository,
                                  PatientRepository patientRepository,
                                  ABACEvaluator abacEvaluator) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.abacEvaluator = abacEvaluator;
    }

    public boolean canAccessPatient(Authentication authentication, UUID patientId) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) {
            return false;
        }
        return abacEvaluator.hasTreatmentRelationship(authentication, patientId);
    }

    public boolean canAccessUser(Authentication authentication, UUID userId) {
        if (authentication == null || !authentication.isAuthenticated() || userId == null) {
            return false;
        }
        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        return userOpt.isPresent() && userOpt.get().getId().equals(userId);
    }
}
