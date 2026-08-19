package com.sentinel;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testPhysicianLogin() throws Exception {
        String jsonRequest = "{\"email\":\"arjun.sharma@aiims.edu\",\"password\":\"Sentinel@123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("arjun.sharma@aiims.edu"))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    public void testAdminLogin() throws Exception {
        String jsonRequest = "{\"email\":\"admin@sentinel.local\",\"password\":\"Sentinel@123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("admin@sentinel.local"))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }
}
