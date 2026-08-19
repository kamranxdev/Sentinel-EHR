package com.sentinel.service;

import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.clinical.repository.DiagnosisRepository;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.dto.DoctorRecommendationDTO;
import com.sentinel.security.entity.Role;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.identity.service.DoctorMatchingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DoctorMatchingServiceTest {

    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private DiagnosisRepository diagnosisRepository;
    private AppointmentRepository appointmentRepository;

    private DoctorMatchingService matchingService;
    private User cardiologist;

    @BeforeEach
    public void setUp() {
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);
        diagnosisRepository = mock(DiagnosisRepository.class);
        appointmentRepository = mock(AppointmentRepository.class);

        matchingService = new DoctorMatchingService(userRepository, patientRepository, diagnosisRepository, appointmentRepository);

        Role doctorRole = new Role("PHYSICIAN", "Doctor");

        Person p = new Person();
        p.setFirstName("Heart");
        p.setLastName("Specialist");

        cardiologist = new User("heart@sentinel.com", "pass", p);
        cardiologist.setId(UUID.randomUUID());
        cardiologist.setRoles(Set.of(doctorRole));

        when(userRepository.searchUsers(null, null, "PHYSICIAN", null)).thenReturn(List.of(cardiologist));
    }

    @Test
    public void testRecommendDoctors_ReturnsDoctors() {
        List<DoctorRecommendationDTO> recs = matchingService.recommendDoctorsForPatient((UUID) null, "Chest pain");

        assertNotNull(recs);
        assertFalse(recs.isEmpty());
    }
}
