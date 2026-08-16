package com.sentinel.vitals;

import com.sentinel.vitals.entity.Vitals;
import org.hl7.fhir.r4.model.Observation;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VitalsEntityTest {

    @Test
    @DisplayName("Should auto-calculate BMI when weight and height are provided")
    void testAutoCalculateBmi() {
        Vitals vitals = new Vitals();
        vitals.setWeightKg(70.0);
        vitals.setHeightCm(175.0);

        // heightM = 1.75, heightM^2 = 3.0625, 70 / 3.0625 = 22.857... -> rounded to 22.9
        assertNotNull(vitals.getBmi());
        assertEquals(22.9, vitals.getBmi());
    }

    @Test
    @DisplayName("Should store and expose explicit systolicBp and diastolicBp properties")
    void testSystolicDiastolicProperties() {
        Vitals vitals = new Vitals();
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);

        assertEquals(120, vitals.getSystolicBp());
        assertEquals(80, vitals.getDiastolicBp());
    }

    @Test
    @DisplayName("Should convert Vitals to FHIR Observation with all vital sign components")
    void testFhirObservationConversion() {
        Vitals vitals = new Vitals();
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);
        vitals.setHeartRate(72);
        vitals.setTemperature(36.8);
        vitals.setOxygenSaturation(98);
        vitals.setWeightKg(70.0);
        vitals.setHeightCm(175.0);
        vitals.setBloodGlucose(105);

        Observation obs = vitals.toFhirResource();
        assertNotNull(obs);
        assertEquals("vital-signs", obs.getCategoryFirstRep().getCodingFirstRep().getCode());
        assertTrue(obs.getComponent().size() >= 7);
    }
}
