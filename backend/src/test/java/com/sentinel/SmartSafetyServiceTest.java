package com.sentinel;

import com.sentinel.clinical.entity.Allergy;
import com.sentinel.clinical.repository.AllergyRepository;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinical.repository.DiagnosisRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.pharmacy.dto.SafetyCheckResultDTO;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import com.sentinel.pharmacy.service.SmartSafetyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class SmartSafetyServiceTest {

    private AllergyRepository allergyRepository;
    private PrescriptionRepository prescriptionRepository;
    private DiagnosisRepository diagnosisRepository;
    private PatientRepository patientRepository;
    private AuditTrailService auditService;
    private SmartSafetyService safetyService;

    private UUID patientId = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        allergyRepository = Mockito.mock(AllergyRepository.class);
        prescriptionRepository = Mockito.mock(PrescriptionRepository.class);
        diagnosisRepository = Mockito.mock(DiagnosisRepository.class);
        patientRepository = Mockito.mock(PatientRepository.class);
        auditService = Mockito.mock(AuditTrailService.class);

        safetyService = new SmartSafetyService(allergyRepository, prescriptionRepository, diagnosisRepository, patientRepository, auditService);
    }

    @Test
    public void testDirectIngredientMatch() {
        Allergy penicillinAllergy = new Allergy();
        penicillinAllergy.setAllergenName("Penicillin G 500mg");
        penicillinAllergy.setStatus("ACTIVE");
        penicillinAllergy.setSeverity("SEVERE");

        when(allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId)).thenReturn(List.of(penicillinAllergy));

        SafetyCheckResultDTO result = safetyService.checkPrescriptionSafety(patientId, "Penicillin G 500mg", "dr_smith", "ROLE_PHYSICIAN");

        assertFalse(result.isSafe(), "Should detect direct allergen match for Penicillin G");
        assertEquals("Penicillin G 500mg", result.getConflictingAllergen());
    }
}
