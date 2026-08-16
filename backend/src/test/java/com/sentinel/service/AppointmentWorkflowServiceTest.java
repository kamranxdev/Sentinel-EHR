package com.sentinel.service;

import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.scheduling.service.AppointmentWorkflowService;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AppointmentWorkflowServiceTest {

    private AppointmentRepository appointmentRepository;
    private UserRepository userRepository;
    private AuditTrailService auditService;

    private AppointmentWorkflowService workflowService;
    private Authentication authMock;
    private User testUser;
    private Patient testPatient;
    private Appointment testAppointment;

    private UUID appointmentId = UUID.randomUUID();
    private UUID patientId = UUID.randomUUID();
    private UUID userId = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        appointmentRepository = mock(AppointmentRepository.class);
        userRepository = mock(UserRepository.class);
        auditService = mock(AuditTrailService.class);

        workflowService = new AppointmentWorkflowService(
                appointmentRepository, userRepository, auditService
        );

        authMock = mock(Authentication.class);
        when(authMock.getName()).thenReturn("doctor_test");

        Person p = new Person();
        p.setFirstName("Dr.");
        p.setLastName("Test");

        testUser = new User("doctor_test", "doc@sentinel.com", "pass", p);
        testUser.setId(userId);
        when(userRepository.findByUsername("doctor_test")).thenReturn(Optional.of(testUser));

        testPatient = new Patient(p);
        testPatient.setId(patientId);

        testAppointment = new Appointment();
        testAppointment.setId(appointmentId);
        testAppointment.setPatient(testPatient);
        testAppointment.setDoctor(testUser);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    public void testCheckInPatient_Success() {
        Appointment updated = workflowService.checkInPatient(appointmentId, "CHECKED_IN", authMock);

        assertNotNull(updated);
        assertEquals("CHECKED_IN", updated.getStatus());
    }
}
