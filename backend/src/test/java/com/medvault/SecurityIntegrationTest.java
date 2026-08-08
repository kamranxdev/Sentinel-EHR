package com.medvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.auth.dto.JwtAuthResponse;
import com.medvault.auth.dto.LoginRequest;
import com.medvault.auth.dto.RegisterRequest;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.users.entity.User;
import com.medvault.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testPublicRegistrationForcesRolePatient() throws Exception {
        String username = "test_self_reg_" + System.currentTimeMillis();
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword("Password123!");
        request.setEmail(username + "@medvault.org");
        request.setFullName("Test Self Reg");
        request.setRoles(Set.of("ROLE_ADMIN", "ROLE_DOCTOR")); // Malicious role escalation attempt

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Optional<User> userOpt = userRepository.findByUsername(username);
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();
        assertEquals(1, user.getRoles().size());
        assertTrue(user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_PATIENT")), "Self-registration must only grant ROLE_PATIENT");
        assertFalse(user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")), "Self-registration must block ROLE_ADMIN escalation");
    }

    @Test
    public void testPublicRegistrationCreatesLinkedPatientProfile() throws Exception {
        String username = "test_onboard_" + System.currentTimeMillis();
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword("Password123!");
        request.setEmail(username + "@medvault.org");
        request.setFullName("Test Patient Onboard");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Optional<User> userOpt = userRepository.findByUsername(username);
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();

        Optional<Patient> patientOpt = patientRepository.findByUserId(user.getId());
        assertTrue(patientOpt.isPresent(), "Self-registration must automatically instantiate a linked Patient profile");
        Patient patient = patientOpt.get();
        assertNotNull(patient.getPatientCode());
        assertTrue(patient.getPatientCode().startsWith("PAT-"));
        assertEquals("Test Patient Onboard", patient.getFullName());
    }

    @Test
    public void testUnauthenticatedAdminCreateUserFails() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("fake_doctor");
        request.setPassword("Password123!");
        request.setEmail("fake_doc@medvault.org");
        request.setFullName("Fake Doctor");
        request.setRoles(Set.of("ROLE_DOCTOR"));

        mockMvc.perform(post("/api/auth/admin/create-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAllRoleLoginsSucceed() throws Exception {
        String[][] credentials = {
            {"admin", "admin123"},
            {"doctor", "doctor123"},
            {"nurse", "nurse123"},
            {"receptionist", "receptionist123"},
            {"labtech", "labtech123"},
            {"pharmacist", "pharmacist123"},
            {"billing", "billing123"},
            {"auditor", "auditor123"},
            {"patient", "patient123"}
        };

        for (String[] cred : credentials) {
            LoginRequest login = new LoginRequest();
            login.setUsername(cred[0]);
            login.setPassword(cred[1]);

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(login)))
                    .andExpect(status().isOk());
        }
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        LoginRequest login = new LoginRequest();
        login.setUsername(username);
        login.setPassword(password);

        String responseBody = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JwtAuthResponse authResponse = objectMapper.readValue(responseBody, JwtAuthResponse.class);
        return authResponse.getAccessToken();
    }

    @Test
    public void testAssignedDoctorCanAccessPatientPrescriptions() throws Exception {
        String token = loginAndGetToken("doctor_mahtab", "doctor123");

        mockMvc.perform(get("/api/prescriptions/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    public void testUnassignedDoctorCannotAccessPatientPrescriptions() throws Exception {
        String token = loginAndGetToken("doctor_rajesh", "doctor123");

        mockMvc.perform(get("/api/prescriptions/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testNurseCannotCreatePrescription() throws Exception {
        String token = loginAndGetToken("nurse_priya", "nurse123");

        String prescriptionJson = objectMapper.writeValueAsString(Map.of(
                "patient", Map.of("id", 1),
                "medicationName", "TestDrug",
                "dosage", "10mg",
                "frequency", "Once daily",
                "durationDays", 7,
                "status", "ACTIVE"
        ));

        mockMvc.perform(post("/api/prescriptions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(prescriptionJson))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testPatientCanAccessOwnVitals() throws Exception {
        String token = loginAndGetToken("user_kamran", "patient123");

        mockMvc.perform(get("/api/vitals/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    public void testPatientCannotAccessOtherPatientVitals() throws Exception {
        String token = loginAndGetToken("user_kamran", "patient123");

        mockMvc.perform(get("/api/vitals/patient/2")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAuditorCanReadAuditLogs() throws Exception {
        String token = loginAndGetToken("auditor", "auditor123");

        mockMvc.perform(get("/api/admin/audit-logs")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    public void testReceptionistCannotReadAuditLogs() throws Exception {
        String token = loginAndGetToken("receptionist", "receptionist123");

        mockMvc.perform(get("/api/admin/audit-logs")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUnassignedDoctorCannotCheckInAppointment() throws Exception {
        String token = loginAndGetToken("doctor_rajesh", "doctor123");

        String checkInJson = objectMapper.writeValueAsString(Map.of(
                "insuranceVerified", true,
                "note", "Test check in"
        ));

        mockMvc.perform(post("/api/appointments/1/check-in")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(checkInJson))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUnassignedDoctorCannotAccessFhirEncounter() throws Exception {
        String token = loginAndGetToken("doctor_rajesh", "doctor123");

        mockMvc.perform(get("/fhir/v1/Encounter/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}
