package com.sentinel.fhir;

import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.identity.entity.User;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class FhirResourceProviderTest {

    @Test
    public void testPatientEntity() {
        Person p = new Person();
        p.setFirstName("Aarav");
        p.setLastName("Sharma");

        Patient patient = new Patient(p);
        UUID id = UUID.randomUUID();
        patient.setId(id);
        patient.setPatientCode("MRN-1001");

        assertNotNull(patient);
        assertEquals(id, patient.getId());
        assertEquals("Aarav Sharma", patient.getFullName());
    }

    @Test
    public void testUserEntity() {
        Person p = new Person();
        p.setFirstName("Dr. Rajesh");
        p.setLastName("Sharma");

        User user = new User("dr_sharma", "dr.sharma@hospital.com", "pass123", p);
        UUID id = UUID.randomUUID();
        user.setId(id);

        assertNotNull(user);
        assertEquals(id, user.getId());
        assertEquals("Dr. Rajesh Sharma", user.getFullName());
    }
}
