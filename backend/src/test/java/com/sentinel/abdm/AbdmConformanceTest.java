package com.sentinel.abdm;

import com.sentinel.abdm.service.AbdmBundleExporterService;
import com.sentinel.abdm.service.AbhaIdentifierService;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.patients.entity.Patient;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.users.entity.User;
import com.sentinel.vitals.entity.Vitals;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Identifier;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AbdmConformanceTest {

    @Test
    public void testAbhaIdentifiers() {
        AbhaIdentifierService service = new AbhaIdentifierService();
        Identifier abhaNum = service.buildAbhaNumberIdentifier("91-1234-5678-9012");
        assertEquals(AbhaIdentifierService.ABHA_NUMBER_SYSTEM, abhaNum.getSystem());
        assertEquals("91-1234-5678-9012", abhaNum.getValue());

        Identifier abhaAddr = service.buildAbhaAddressIdentifier("kamran@sbx");
        assertEquals(AbhaIdentifierService.ABHA_ADDRESS_SYSTEM, abhaAddr.getSystem());
        assertEquals("kamran@sbx", abhaAddr.getValue());
    }

    @Test
    public void testOpConsultRecordBundleExporter() {
        AbdmBundleExporterService exporter = new AbdmBundleExporterService();

        Patient patient = new Patient();
        patient.setId(101L);
        patient.setFullName("Priya Patel");
        patient.setPatientCode("MRN-2001");
        patient.setAbhaId("91-8888-7777-6666");

        User doctor = new User("dr_patel", "pass123", "dr.patel@hospital.com", "Dr. Vikram Patel");
        doctor.setId(501L);

        Encounter encounter = new Encounter();
        encounter.setId(301L);
        encounter.setPatient(patient);
        encounter.setAttendingProvider(doctor);

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setId(401L);
        diagnosis.setPatient(patient);
        diagnosis.setConditionName("Essential Hypertension");
        diagnosis.setIcdCode("I10");

        Prescription rx = new Prescription();
        rx.setId(601L);
        rx.setPatient(patient);
        rx.setMedicationName("Amlodipine 5mg");

        Vitals vitals = new Vitals();
        vitals.setId(701L);
        vitals.setPatient(patient);
        vitals.setBloodPressure("130/85");

        Bundle bundle = exporter.createOpConsultRecordBundle(patient, encounter, List.of(diagnosis), List.of(rx), List.of(vitals));

        assertNotNull(bundle);
        assertEquals(Bundle.BundleType.DOCUMENT, bundle.getType());
        assertEquals("https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord", bundle.getMeta().getProfile().get(0).getValue());
        assertTrue(bundle.getEntry().size() >= 5);
    }
}
