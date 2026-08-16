package com.sentinel.clinical;

import com.sentinel.clinical.entity.Vitals;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class VitalsEntityTest {

    @Test
    @DisplayName("Should auto-calculate BMI when weight and height are provided")
    void testAutoCalculateBmi() {
        Vitals vitals = new Vitals();
        vitals.setWeightKg(new BigDecimal("70.0"));
        vitals.setHeightCm(new BigDecimal("175.0"));

        assertNotNull(vitals.getBmi());
        assertEquals(new BigDecimal("22.9"), vitals.getBmi());
    }

    @Test
    @DisplayName("Should store and expose explicit systolicBp and diastolicBp properties")
    void testSystolicDiastolicProperties() {
        Vitals vitals = new Vitals();
        vitals.setSystolicBp(new BigDecimal("120"));
        vitals.setDiastolicBp(new BigDecimal("80"));

        assertEquals(new BigDecimal("120"), vitals.getSystolicBp());
        assertEquals(new BigDecimal("80"), vitals.getDiastolicBp());
    }
}
