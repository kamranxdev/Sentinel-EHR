package com.sentinel;

import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
    private AuditLogRepository auditLogRepository;

    @BeforeEach
    public void setUp() {
    }

    @Test
    public void testPublicRegistrationForcesRolePatient() throws Exception {
        String regJson = """
                {
                    "username": "self_reg_patient",
                    "password": "Password123!",
                    "email": "self_reg@example.com",
                    "fullName": "Self Registered Patient",
                    "roles": ["ROLE_ADMIN"]
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(regJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_PATIENT"))
                .andExpect(jsonPath("$.patientCode").exists());
    }

    @Test
    public void testPublicRegistrationCreatesLinkedPatientProfile() throws Exception {
        long patientCountBefore = patientRepository.count();

        String regJson = """
                {
                    "username": "self_reg_patient2",
                    "password": "Password123!",
                    "email": "self_reg2@example.com",
                    "fullName": "Self Registered Patient Two"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(regJson))
                .andExpect(status().isOk());

        assertEquals(patientCountBefore + 1, patientRepository.count());
    }

    @Test
    public void testUnauthenticatedAdminCreateUserFails() throws Exception {
        String regJson = """
                {
                    "username": "unauth_created_doctor",
                    "password": "Password123!",
                    "email": "unauth_doc@example.com",
                    "fullName": "Unauth Doctor",
                    "roles": ["ROLE_DOCTOR"]
                }
                """;

        mockMvc.perform(post("/api/v1/auth/admin/create-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(regJson))
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
            {"patient", "patient123"}
        };

        for (String[] cred : credentials) {
            String loginJson = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", cred[0], cred[1]);
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(loginJson))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").exists());
        }
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        String loginJson = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        String responseBody = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return com.jayway.jsonpath.JsonPath.read(responseBody, "$.accessToken");
    }

    @Test
    public void testAssignedDoctorCanAccessPatientPrescriptions() throws Exception {
        String token = loginAndGetToken("doctor_mahtab", "doctor123");

        mockMvc.perform(get("/api/v1/prescriptions/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    public void testUnassignedDoctorCannotAccessPatientPrescriptions() throws Exception {
        String token = loginAndGetToken("doctor_rajesh", "doctor123");

        mockMvc.perform(get("/api/v1/prescriptions/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testNurseCannotCreatePrescription() throws Exception {
        String token = loginAndGetToken("nurse", "nurse123");

        String prescriptionJson = """
                {
                    "patientId": 1,
                    "medicationName": "Amoxicillin",
                    "dosage": "500mg",
                    "frequency": "TID",
                    "durationDays": 7,
                    "instructions": "Take with food"
                }
                """;

        mockMvc.perform(post("/api/v1/prescriptions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(prescriptionJson))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testPatientCanAccessOwnVitals() throws Exception {
        String token = loginAndGetToken("patient", "patient123");

        mockMvc.perform(get("/api/v1/vitals/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    public void testPatientCannotAccessOtherPatientVitals() throws Exception {
        String token = loginAndGetToken("patient", "patient123");

        mockMvc.perform(get("/api/v1/vitals/patient/2")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAuditorCanReadAuditLogs() throws Exception {
        String token = loginAndGetToken("auditor", "auditor123");

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    public void testReceptionistCannotReadAuditLogs() throws Exception {
        String token = loginAndGetToken("receptionist", "receptionist123");

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUnassignedDoctorCannotCheckInAppointment() throws Exception {
        String token = loginAndGetToken("doctor_rajesh", "doctor123");

        String checkInJson = "{\"insuranceVerified\": true, \"note\": \"Check-in\"}";

        mockMvc.perform(post("/api/v1/appointments/1/check-in")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(checkInJson))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUnassignedDoctorCannotAccessFhirEncounter() throws Exception {
        String token = loginAndGetToken("doctor_rajesh", "doctor123");

        mockMvc.perform(get("/api/v1/encounters/patient/1")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testPatientUser8GetPatientByUserIdSucceeds() throws Exception {
        String token = loginAndGetToken("patient", "patient123");

        mockMvc.perform(get("/api/v1/patients/user/9")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
