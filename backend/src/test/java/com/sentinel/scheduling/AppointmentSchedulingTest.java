package com.sentinel.scheduling;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.response.ApiResponse;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.UserOrganizationRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.scheduling.controller.AppointmentController;
import com.sentinel.scheduling.dto.AppointmentResponseDTO;
import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.scheduling.service.AppointmentService;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AppointmentSchedulingTest {

    private AppointmentRepository appointmentRepository;
    private PatientRepository patientRepository;
    private UserRepository userRepository;
    private PractitionerRepository practitionerRepository;
    private UserOrganizationRepository userOrganizationRepository;
    private OrganizationRepository organizationRepository;
    private DepartmentRepository departmentRepository;
    private AuditService auditService;
    private com.sentinel.clinical.repository.VitalsRepository vitalsRepository;

    private AppointmentService appointmentService;
    private AppointmentController appointmentController;

    private UUID doctorUserId = UUID.randomUUID();
    private UUID practitionerId = UUID.randomUUID();
    private UUID orgId = UUID.randomUUID();
    private UUID patientId = UUID.randomUUID();

    private User doctorUser;
    private Practitioner practitioner;
    private Organization organization;
    private Patient patient;
    private Appointment appointment;

    @BeforeEach
    public void setup() {
        appointmentRepository = mock(AppointmentRepository.class);
        patientRepository = mock(PatientRepository.class);
        userRepository = mock(UserRepository.class);
        practitionerRepository = mock(PractitionerRepository.class);
        userOrganizationRepository = mock(UserOrganizationRepository.class);
        organizationRepository = mock(OrganizationRepository.class);
        departmentRepository = mock(DepartmentRepository.class);
        auditService = mock(AuditService.class);
        vitalsRepository = mock(com.sentinel.clinical.repository.VitalsRepository.class);

        appointmentService = new AppointmentService(
                appointmentRepository,
                patientRepository,
                userRepository,
                practitionerRepository,
                userOrganizationRepository,
                organizationRepository,
                departmentRepository,
                auditService,
                vitalsRepository
        );

        appointmentController = new AppointmentController(appointmentService);

        Person person = new Person();
        person.setId(UUID.randomUUID());
        person.setFirstName("Sarah");
        person.setLastName("Connor");

        doctorUser = new User("sarah@sentinel.org", "pass", person);
        doctorUser.setId(doctorUserId);

        practitioner = new Practitioner();
        practitioner.setId(practitionerId);
        practitioner.setPerson(person);
        practitioner.setIdentifier("PRAC-001");

        organization = new Organization();
        organization.setId(orgId);
        organization.setName("General Hospital");

        patient = new Patient(person);
        patient.setId(patientId);

        appointment = new Appointment();
        appointment.setId(UUID.randomUUID());
        appointment.setPractitioner(doctorUser);
        appointment.setOrganization(organization);
        appointment.setPatient(patient);
        appointment.setStatus("SCHEDULED");
        appointment.setStartsAt(OffsetDateTime.now());
        appointment.setEndsAt(OffsetDateTime.now().plusMinutes(30));
    }

    @Test
    public void testGetPhysicianOrganizationAppointments_WithDoctorUserId() {
        when(userRepository.existsById(doctorUserId)).thenReturn(true);
        when(appointmentRepository.findByPractitionerIdAndOrganizationIdOrderByStartsAtDesc(doctorUserId, orgId))
                .thenReturn(List.of(appointment));

        List<AppointmentResponseDTO> result = appointmentService.getPhysicianOrganizationAppointments(doctorUserId, orgId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(appointment.getId(), result.get(0).getId());
        assertEquals(doctorUserId, result.get(0).getPractitionerId());
        assertEquals(orgId, result.get(0).getOrganizationId());
    }

    @Test
    public void testGetPhysicianOrganizationAppointments_WithPractitionerIdResolution() {
        when(userRepository.existsById(practitionerId)).thenReturn(false);
        when(practitionerRepository.findById(practitionerId)).thenReturn(Optional.of(practitioner));
        when(userRepository.findByPersonId(practitioner.getPerson().getId())).thenReturn(Optional.of(doctorUser));
        when(appointmentRepository.findByPractitionerIdAndOrganizationIdOrderByStartsAtDesc(doctorUserId, orgId))
                .thenReturn(List.of(appointment));

        List<AppointmentResponseDTO> result = appointmentService.getPhysicianOrganizationAppointments(practitionerId, orgId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(appointment.getId(), result.get(0).getId());
        assertEquals(doctorUserId, result.get(0).getPractitionerId());
    }

    @Test
    public void testController_GetPhysicianOrganizationAppointmentsEndpoint() {
        when(userRepository.existsById(doctorUserId)).thenReturn(true);
        when(appointmentRepository.findByPractitionerIdAndOrganizationIdOrderByStartsAtDesc(doctorUserId, orgId))
                .thenReturn(List.of(appointment));

        ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> response =
                appointmentController.getPhysicianOrganizationAppointments(orgId, doctorUserId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    public void testController_GetAppointmentsWithQueryParams() {
        when(userRepository.existsById(doctorUserId)).thenReturn(true);
        when(appointmentRepository.findByPractitionerIdAndOrganizationIdOrderByStartsAtDesc(doctorUserId, orgId))
                .thenReturn(List.of(appointment));

        ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> response =
                appointmentController.getAppointments(doctorUserId, orgId, null);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().getData().size());
    }
}
