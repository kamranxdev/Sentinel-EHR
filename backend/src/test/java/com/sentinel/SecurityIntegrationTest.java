package com.sentinel;

import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.identity.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

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

    @Test
    public void testUnauthenticatedAdminCreateUserFails() throws Exception {
        String regJson = """
                {
                    "email": "unauth_doc@example.com",
                    "password": "Password123!",
                    "fullName": "Unauth Doctor"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/admin/create-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(regJson))
                .andExpect(status().isUnauthorized());
    }
}
