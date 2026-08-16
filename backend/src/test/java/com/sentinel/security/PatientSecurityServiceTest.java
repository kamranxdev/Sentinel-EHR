package com.sentinel.security;

import com.sentinel.security.evaluator.ABACEvaluator;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.patient.service.PatientSecurityService;
import com.sentinel.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PatientSecurityServiceTest {

    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private ABACEvaluator abacEvaluator;

    private PatientSecurityService securityService;
    private Authentication doctorAuth;

    private UUID patientId = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);
        abacEvaluator = mock(ABACEvaluator.class);

        securityService = new PatientSecurityService(userRepository, patientRepository, abacEvaluator);

        doctorAuth = mock(Authentication.class);
        when(doctorAuth.isAuthenticated()).thenReturn(true);
        when(doctorAuth.getName()).thenReturn("doctor_mahtab");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_PHYSICIAN"))).when(doctorAuth).getAuthorities();
    }

    @Test
    public void testCanAccessPatient_DelegatesToAbacEvaluator() {
        when(abacEvaluator.hasTreatmentRelationship(doctorAuth, patientId)).thenReturn(true);

        boolean allowed = securityService.canAccessPatient(doctorAuth, patientId);

        assertTrue(allowed);
        verify(abacEvaluator, times(1)).hasTreatmentRelationship(doctorAuth, patientId);
    }
}
