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
public class OrganizationRegistrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testRegisterOrganizationEndpoint() throws Exception {
        String jsonPayload = """
            {
                "orgName": "Fortis Memorial Research Institute",
                "orgCode": "FORTIS-GURGAON",
                "code": "FORTIS-GURGAON",
                "legalName": "Fortis Healthcare Limited",
                "organizationType": "HOSPITAL",
                "licenseNumber": "NABH/2026/HR/088",
                "email": "contact@fortisgurgaon.com",
                "phone": "+91 124 4921021",
                "address": "Sector 44, Gurugram, Haryana 122002",
                "website": "https://www.fortishealthcare.com",
                "countryCode": "IN",
                "timezone": "Asia/Kolkata",
                "adminFullName": "Dr. Rohit Verma",
                "adminEmail": "orgadmin_rohit",
                "adminEmail": "rohit.verma@fortisgurgaon.com",
                "adminPassword": "Sentinel@Admin2026"
            }
        """;

        mockMvc.perform(post("/api/v1/organizations/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("FORTIS-GURGAON"))
                .andExpect(jsonPath("$.data.name").value("Fortis Memorial Research Institute"));
    }
}
