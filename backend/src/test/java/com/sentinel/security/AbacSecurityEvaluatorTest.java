package com.sentinel.security;

import com.sentinel.security.abac.AbacSecurityEvaluator;
import com.sentinel.security.service.BreakGlassService;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AbacSecurityEvaluatorTest {

    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private BreakGlassService breakGlassService;
    private AbacSecurityEvaluator evaluator;

    private UUID patientId = UUID.randomUUID();
    private UUID userId = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);
        breakGlassService = mock(BreakGlassService.class);

        evaluator = new AbacSecurityEvaluator(userRepository, patientRepository, breakGlassService);
    }

    @Test
    public void testSysAdminBypassesRelationshipCheck() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("sysadmin");
        doReturn(List.of(new SimpleGrantedAuthority("SUPER_ADMIN"))).when(auth).getAuthorities();

        boolean allowed = evaluator.hasTreatmentRelationship(auth, patientId);
        assertTrue(allowed, "SUPER_ADMIN must bypass relationship check");
    }

    @Test
    public void testAuditorBypassesRelationshipCheck() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("compliance_auditor");
        doReturn(List.of(new SimpleGrantedAuthority("AUDITOR"))).when(auth).getAuthorities();

        boolean allowed = evaluator.hasTreatmentRelationship(auth, patientId);
        assertTrue(allowed, "AUDITOR must bypass relationship check");
    }

    @Test
    public void testPhysicianBypassesPatientCheckInAccessData() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        doReturn(List.of(new SimpleGrantedAuthority("PHYSICIAN"))).when(auth).getAuthorities();

        boolean allowed = evaluator.canAccessPatientData(auth, patientId, "READ");
        assertTrue(allowed, "PHYSICIAN must have access");
    }

    @Test
    public void testNurseAccessRequiresTreatmentRelationshipOrBreakGlass() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("nurse_sunita");
        doReturn(List.of(new SimpleGrantedAuthority("NURSE"))).when(auth).getAuthorities();

        User user = new User();
        user.setId(userId);
        when(userRepository.findByUsername("nurse_sunita")).thenReturn(Optional.of(user));

        // Path A: No relationship, no break glass -> DENIED
        when(patientRepository.existsById(patientId)).thenReturn(false);
        when(breakGlassService.hasActiveBreakGlass(userId, patientId)).thenReturn(false);
        assertFalse(evaluator.canAccessPatientData(auth, patientId, "READ"));

        // Path B: Active Break-Glass override -> ALLOWED
        when(breakGlassService.hasActiveBreakGlass(userId, patientId)).thenReturn(true);
        assertTrue(evaluator.canAccessPatientData(auth, patientId, "READ"));

        // Path C: Active Treatment relationship -> ALLOWED
        when(patientRepository.existsById(patientId)).thenReturn(true);
        assertTrue(evaluator.canAccessPatientData(auth, patientId, "READ"));
    }
}
