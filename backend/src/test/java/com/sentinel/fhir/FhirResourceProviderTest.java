package com.sentinel.fhir;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.appointments.entity.Appointment;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.patients.entity.Patient;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.users.entity.User;
import com.sentinel.vitals.entity.Vitals;
import org.hl7.fhir.r4.model.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class FhirResourceProviderTest {

    @Test
    public void testPatientToFhirResource() {
        Patient patient = new Patient();
        patient.setId(101L);
        patient.setPatientCode("MRN-1001");
        patient.setAbhaId("91-1234-5678-9012");
        patient.setFullName("Aarav Sharma");
        patient.setGender("MALE");
        patient.setDateOfBirth(LocalDate.of(1990, 5, 15));
        patient.setPhone("+919876543210");
        patient.setEmail("aarav.sharma@example.com");

        org.hl7.fhir.r4.model.Patient fhirPatient = patient.toFhirResource();

        assertNotNull(fhirPatient);
        assertEquals("Patient/101", fhirPatient.getId());
        assertEquals("Aarav Sharma", fhirPatient.getNameFirstRep().getNameAsSingleString());
        assertEquals(Enumerations.AdministrativeGender.MALE, fhirPatient.getGender());
        assertEquals("MRN-1001", fhirPatient.getIdentifierFirstRep().getValue());
    }

    @Test
    public void testPractitionerToFhirResource() {
        User user = new User("dr_sharma", "pass123", "dr.sharma@hospital.com", "Dr. Rajesh Sharma");
        user.setId(201L);
        user.setSpecialization("Cardiology");
        user.setLicenseNumber("MCI-98765");

        Practitioner practitioner = user.toFhirPractitioner();
        assertNotNull(practitioner);
        assertEquals("Practitioner/201", practitioner.getId());
        assertEquals("Dr. Rajesh Sharma", practitioner.getNameFirstRep().getNameAsSingleString());

        PractitionerRole role = user.toFhirPractitionerRole();
        assertNotNull(role);
        assertEquals("Cardiology", role.getSpecialtyFirstRep().getText());
    }

    @Test
    public void testDiagnosisToFhirCondition() {
        Patient patient = new Patient();
        patient.setId(101L);

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setId(301L);
        diagnosis.setPatient(patient);
        diagnosis.setConditionName("Type 2 Diabetes Mellitus");
        diagnosis.setIcdCode("E11.9");
        diagnosis.setSnomedCode("44054006");
        diagnosis.setStatus("ACTIVE");

        Condition condition = diagnosis.toFhirResource();
        assertNotNull(condition);
        assertEquals("Condition/301", condition.getId());
        assertEquals("Type 2 Diabetes Mellitus", condition.getCode().getText());
        assertEquals("active", condition.getClinicalStatus().getCodingFirstRep().getCode());
    }

    @Test
    public void testPrescriptionToFhirMedicationRequest() {
        Patient patient = new Patient();
        patient.setId(101L);

        Prescription prescription = new Prescription();
        prescription.setId(401L);
        prescription.setPatient(patient);
        prescription.setMedicationName("Metformin 500mg");
        prescription.setDosage("500mg");
        prescription.setFrequency("Twice daily after meals");
        prescription.setStatus("ACTIVE");

        MedicationRequest medReq = prescription.toFhirResource();
        assertNotNull(medReq);
        assertEquals("MedicationRequest/401", medReq.getId());
        assertEquals("Metformin 500mg", medReq.getMedicationCodeableConcept().getText());
        assertEquals(MedicationRequest.MedicationRequestStatus.ACTIVE, medReq.getStatus());
    }

    @Test
    public void testVitalsToFhirObservation() {
        Patient patient = new Patient();
        patient.setId(101L);

        Vitals vitals = new Vitals();
        vitals.setId(501L);
        vitals.setPatient(patient);
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);
        vitals.setHeartRate(72);
        vitals.setOxygenSaturation(98);
        vitals.setTemperature(37.0);

        Observation obs = vitals.toFhirResource();
        assertNotNull(obs);
        assertEquals("Observation/501", obs.getId());
        assertEquals(Observation.ObservationStatus.FINAL, obs.getStatus());
        assertTrue(obs.hasComponent());
    }
}
