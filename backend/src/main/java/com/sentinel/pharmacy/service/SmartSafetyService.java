package com.sentinel.pharmacy.service;

import com.sentinel.clinical.entity.Allergy;
import com.sentinel.clinical.repository.AllergyRepository;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinical.repository.DiagnosisRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import com.sentinel.pharmacy.dto.SafetyCheckResultDTO;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SmartSafetyService {

    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final AuditTrailService auditService;

    public SmartSafetyService(AllergyRepository allergyRepository,
                              PrescriptionRepository prescriptionRepository,
                              DiagnosisRepository diagnosisRepository,
                              PatientRepository patientRepository,
                              AuditTrailService auditService) {
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    public SafetyCheckResultDTO checkPrescriptionSafety(UUID patientId, String medicationName, String actorUsername, String actorRole) {
        if (patientId == null || medicationName == null || medicationName.trim().isEmpty()) {
            return new SafetyCheckResultDTO(true, "NONE", null, "No medication specified for check.");
        }

        String medClean = medicationName.trim().toUpperCase();
        List<Allergy> activeAllergies = allergyRepository != null ? allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId) : Collections.emptyList();
        for (Allergy allergy : activeAllergies) {
            String allergenClean = allergy.getAllergenName() != null ? allergy.getAllergenName().trim() : "";
            if (allergenClean.equalsIgnoreCase(medClean)) {
                String details = "CONTRAINDICATION WARNING: Patient has documented active allergy to '" 
                        + allergy.getAllergenName() + "' (Severity: " + allergy.getSeverity() + "). Requested Rx: " + medicationName;
                return new SafetyCheckResultDTO(false, allergy.getSeverity(), allergy.getAllergenName(), details, "ALLERGY_DIRECT");
            }
        }

        return new SafetyCheckResultDTO(true, "NONE", null, "No contraindications detected.");
    }
}
