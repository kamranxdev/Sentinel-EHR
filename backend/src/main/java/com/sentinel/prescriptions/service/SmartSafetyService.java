package com.sentinel.prescriptions.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.prescriptions.dto.SafetyCheckResultDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SmartSafetyService {

    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PatientRepository patientRepository;
    private final AuditTrailService auditService;

    private static final Map<String, List<String>> DRUG_CLASS_MAPPING = new LinkedHashMap<>();
    private static final Map<String, List<String>> CLASS_CROSS_SENSITIVITY = new LinkedHashMap<>();

    static {
        DRUG_CLASS_MAPPING.put("PENICILLIN", List.of("PENICILLIN", "AMOXICILLIN", "AMPICILLIN", "AUGMENTIN", "PIPERACILLIN", "AMOXI", "PENICILLIN G", "PENICILLIN V"));
        DRUG_CLASS_MAPPING.put("CEPHALOSPORIN", List.of("CEPHALEXIN", "CEFTRIAXONE", "CEFAZOLIN", "CEFDINIR", "CEFADROXIL", "CEFUROXIME", "CEFEPIME"));
        DRUG_CLASS_MAPPING.put("SULFA", List.of("SULFAMETHOXAZOLE", "TRIMETHOPRIM", "BACTRIM", "SULFASALAZINE", "SULFACETAMIDE"));
        DRUG_CLASS_MAPPING.put("NSAID", List.of("IBUPROFEN", "ASPIRIN", "NAPROXEN", "KETOROLAC", "MELOXICAM", "CELECOXIB", "DICLOFENAC", "INDOMETHACIN", "ADVIL", "ALEVE", "MOTRIN"));
        DRUG_CLASS_MAPPING.put("OPIOID", List.of("CODEINE", "MORPHINE", "OXYCODONE", "HYDROCODONE", "FENTANYL", "HYDROMORPHONE", "TRAMADOL", "PERCOCET", "VICODIN"));
        DRUG_CLASS_MAPPING.put("BENZODIAZEPINE", List.of("ALPRAZOLAM", "XANAX", "DIAZEPAM", "VALIUM", "LORAZEPAM", "ATIVAN", "CLONAZEPAM", "KLONOPIN"));
        DRUG_CLASS_MAPPING.put("BETA_BLOCKER", List.of("PROPRANOLOL", "ATENOLOL", "METOPROLOL", "CARVEDILOL", "LABETALOL", "BISOPROLOL", "INDERAL", "TOPROL"));
        DRUG_CLASS_MAPPING.put("ACE_INHIBITOR", List.of("LISINOPRIL", "ENALAPRIL", "RAMIPRIL", "CAPTOPRIL", "BENAZEPRIL", "PRINIVIL", "ZESTRIL"));
        DRUG_CLASS_MAPPING.put("FLUOROQUINOLONE", List.of("CIPROFLOXACIN", "LEVOFLOXACIN", "MOXIFLOXACIN", "CIPRO", "LEVAQUIN"));
        DRUG_CLASS_MAPPING.put("MACROLIDE", List.of("AZITHROMYCIN", "ERYTHROMYCIN", "CLARITHROMYCIN", "ZITHROMAX"));
        DRUG_CLASS_MAPPING.put("ANTICOAGULANT", List.of("WARFARIN", "COUMADIN", "HEPARIN", "RIVAROXABAN", "XARELTO", "APIXABAN", "ELIQUIS"));
        DRUG_CLASS_MAPPING.put("SSRI", List.of("FLUOXETINE", "PROZAC", "SERTRALINE", "ZOLOFT", "CITALOPRAM", "CELEXA", "ESCITALOPRAM", "LEXAPRO", "PAROXETINE", "PAXIL"));

        CLASS_CROSS_SENSITIVITY.put("PENICILLIN", List.of("CEPHALOSPORIN"));
        CLASS_CROSS_SENSITIVITY.put("CEPHALOSPORIN", List.of("PENICILLIN"));
    }

    public SmartSafetyService(AllergyRepository allergyRepository, AuditTrailService auditService) {
        this(allergyRepository, null, null, null, auditService);
    }

    @Autowired
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

    public SafetyCheckResultDTO checkPrescriptionSafety(Long patientId, String medicationName, String actorUsername, String actorRole) {
        if (patientId == null || medicationName == null || medicationName.trim().isEmpty()) {
            return new SafetyCheckResultDTO(true, "NONE", null, "No medication specified for check.");
        }

        String medClean = medicationName.trim().toUpperCase();
        Patient patient = patientRepository != null ? patientRepository.findById(patientId).orElse(null) : null;

        List<Allergy> activeAllergies = allergyRepository != null ? allergyRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        for (Allergy allergy : activeAllergies) {
            String allergenClean = allergy.getAllergenName() != null ? allergy.getAllergenName().trim() : "";
            if (allergenClean.isEmpty()) continue;

            if (isDirectMatch(medClean, allergenClean)) {
                String details = "CONTRAINDICATION WARNING: Patient has documented active allergy to '" 
                        + allergy.getAllergenName() + "' (Severity: " + allergy.getSeverity() + "). Requested Rx: " + medicationName;
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, allergy.getSeverity(), allergy.getAllergenName(), details, "ALLERGY_DIRECT");
            }

            String allergenClass = findDrugClass(allergenClean);
            String medClass = findDrugClass(medClean);

            if (allergenClass != null && allergenClass.equalsIgnoreCase(medClass)) {
                String details = "DRUG-CLASS CONTRAINDICATION WARNING: Patient has documented active " + allergenClass 
                        + " class allergy ('" + allergy.getAllergenName() + "', Severity: " + allergy.getSeverity() 
                        + "). High risk for prescribed medication: " + medicationName;
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "HIGH_RISK_" + allergy.getSeverity(), allergy.getAllergenName(), details, "ALLERGY_CLASS");
            }

            if (allergenClass != null && medClass != null) {
                List<String> sensitiveClasses = CLASS_CROSS_SENSITIVITY.get(allergenClass);
                if (sensitiveClasses != null && sensitiveClasses.contains(medClass)) {
                    String details = "CROSS-CLASS BETA-LACTAM SENSITIVITY WARNING: Active " 
                            + allergenClass + " allergy ('" + allergy.getAllergenName() 
                            + "') has potential cross-reactivity with " + medClass + " drug class (" + medicationName + ").";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResultDTO(false, "CROSS_REACTIVITY_WARNING", allergy.getAllergenName(), details, "ALLERGY_CROSS");
                }
            }
        }

        if (patient != null && patient.getFoodAllergies() != null && !patient.getFoodAllergies().trim().isEmpty()) {
            String foodAllergiesUpper = patient.getFoodAllergies().toUpperCase();
            
            if (foodAllergiesUpper.contains("PEANUT") || foodAllergiesUpper.contains("SOY")) {
                if (medClean.contains("PROPOFOL") || medClean.contains("CLEVIPREX") || medClean.contains("INTRALIPID")) {
                    String details = "FOOD/EXCIPIENT ALLERGY WARNING: Patient profile lists Peanut/Soy allergy. Medication '" 
                            + medicationName + "' contains soy/egg phospholipid emulsion.";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResultDTO(false, "SEVERE", "Peanut/Soy Excipient", details, "ALLERGY_FOOD");
                }
            }
            if (foodAllergiesUpper.contains("EGG")) {
                if (medClean.contains("PROPOFOL") || medClean.contains("INFLUENZA")) {
                    String details = "FOOD/EXCIPIENT ALLERGY WARNING: Patient profile lists Egg allergy. Medication '" 
                            + medicationName + "' contains egg-derived protein formulation.";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResultDTO(false, "SEVERE", "Egg Excipient", details, "ALLERGY_FOOD");
                }
            }
            if (foodAllergiesUpper.contains("SULFI")) {
                if (medClean.contains("EPINEPHRINE") || medClean.contains("DEXAMETHASONE")) {
                    String details = "EXCIPIENT SENSITIVITY WARNING: Patient profile lists Sulfite sensitivity. Formulations may contain sodium metabisulfite.";
                    logAlert(actorUsername, actorRole, patientId, details);
                    return new SafetyCheckResultDTO(false, "MODERATE", "Sulfite Excipient", details, "ALLERGY_FOOD");
                }
            }
        }

        List<Prescription> activeRxList = prescriptionRepository != null ? prescriptionRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        String newMedClass = findDrugClass(medClean);

        for (Prescription activeRx : activeRxList) {
            String activeMedClean = activeRx.getMedicationName().toUpperCase();
            String activeMedClass = findDrugClass(activeMedClean);

            if (activeMedClean.equalsIgnoreCase(medClean) || (newMedClass != null && newMedClass.equalsIgnoreCase(activeMedClass))) {
                String details = "DUPLICATE THERAPY WARNING: Patient already has an active prescription for '" 
                        + activeRx.getMedicationName() + "' (Dosage: " + activeRx.getDosage() + ").";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "WARNING", activeRx.getMedicationName(), details, "DUPLICATE_THERAPY");
            }

            if ((isClass(newMedClass, activeMedClean, "ANTICOAGULANT") && isClass(activeMedClass, activeMedClean, "NSAID")) ||
                (isClass(newMedClass, medClean, "NSAID") && isClass(activeMedClass, activeMedClean, "ANTICOAGULANT"))) {
                String details = "CRITICAL DRUG-DRUG INTERACTION: Combining Anticoagulant (" + activeRx.getMedicationName() 
                        + ") with NSAID (" + medicationName + ") significantly increases risk of major internal / GI hemorrhage.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "CRITICAL", activeRx.getMedicationName(), details, "DDI_BLEED_RISK");
            }

            if ((isClass(newMedClass, medClean, "OPIOID") && isClass(activeMedClass, activeMedClean, "BENZODIAZEPINE")) ||
                (isClass(newMedClass, medClean, "BENZODIAZEPINE") && isClass(activeMedClass, activeMedClean, "OPIOID"))) {
                String details = "CRITICAL DRUG-DRUG INTERACTION: Concurrent prescribing of Opioids (" + medicationName 
                        + ") and Benzodiazepines (" + activeRx.getMedicationName() + ") results in severe CNS/respiratory depression & overdose risk.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "CRITICAL", activeRx.getMedicationName(), details, "DDI_RESPIRATORY_DEPRESSION");
            }

            if ((isClass(newMedClass, medClean, "ACE_INHIBITOR") && (activeMedClean.contains("SPIRONOLACTONE") || activeMedClean.contains("POTASSIUM"))) ||
                ((medClean.contains("SPIRONOLACTONE") || medClean.contains("POTASSIUM")) && isClass(activeMedClass, activeMedClean, "ACE_INHIBITOR"))) {
                String details = "DRUG-DRUG INTERACTION WARNING: ACE Inhibitor (" + medicationName 
                        + ") combined with Potassium-sparing agent (" + activeRx.getMedicationName() + ") elevates risk of severe hyperkalemia.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "HIGH", activeRx.getMedicationName(), details, "DDI_HYPERKALEMIA");
            }
        }

        List<Diagnosis> activeDiagnoses = diagnosisRepository != null ? diagnosisRepository.findByPatientIdAndStatus(patientId, "ACTIVE") : Collections.emptyList();
        String seriousCondSummary = (patient != null && patient.getSeriousConditions() != null) ? patient.getSeriousConditions().toUpperCase() : "";

        for (Diagnosis diag : activeDiagnoses) {
            String condUpper = diag.getConditionName().toUpperCase();

            if (isClass(newMedClass, medClean, "BETA_BLOCKER") && (condUpper.contains("ASTHMA") || condUpper.contains("COPD") || condUpper.contains("BRONCHOSPASM"))) {
                String details = "DRUG-DISEASE CONTRAINDICATION: Non-selective Beta Blockers (" + medicationName 
                        + ") are contraindicated in active Asthma/COPD ('" + diag.getConditionName() + "') due to fatal bronchospasm risk.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "CRITICAL", diag.getConditionName(), details, "CONTRAINDICATION_ASTHMA");
            }

            if (isClass(newMedClass, medClean, "NSAID") && (condUpper.contains("KIDNEY") || condUpper.contains("RENAL") || condUpper.contains("ULCER") || condUpper.contains("CKD"))) {
                String details = "DRUG-DISEASE CONTRAINDICATION: NSAID (" + medicationName 
                        + ") is contraindicated in patient with Renal Impairment / GI Ulcer disease ('" + diag.getConditionName() + "').";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "HIGH", diag.getConditionName(), details, "CONTRAINDICATION_RENAL");
            }

            if (medClean.contains("METFORMIN") && (condUpper.contains("RENAL FAILURE") || condUpper.contains("STAGE 4") || condUpper.contains("STAGE 5"))) {
                String details = "DRUG-DISEASE CONTRAINDICATION: Metformin is contraindicated in severe Renal Failure ('" 
                        + diag.getConditionName() + "') due to lactic acidosis risk.";
                logAlert(actorUsername, actorRole, patientId, details);
                return new SafetyCheckResultDTO(false, "CRITICAL", diag.getConditionName(), details, "CONTRAINDICATION_METFORMIN");
            }
        }

        if (isClass(newMedClass, medClean, "BETA_BLOCKER") && seriousCondSummary.contains("ASTHMA")) {
            String details = "DRUG-DISEASE CONTRAINDICATION: Patient serious condition history lists Asthma. Beta Blocker (" + medicationName + ") triggered warning.";
            logAlert(actorUsername, actorRole, patientId, details);
            return new SafetyCheckResultDTO(false, "CRITICAL", "Asthma", details, "CONTRAINDICATION_ASTHMA");
        }

        return new SafetyCheckResultDTO(true, "NONE", null, "No allergy, DDI, or disease contraindications detected. Prescription safe to proceed.", "SAFE");
    }

    private boolean isDirectMatch(String med, String allergen) {
        String m = med.toUpperCase();
        String a = allergen.toUpperCase();
        return m.contains(a) || a.contains(m);
    }

    private String findDrugClass(String med) {
        String m = med.toUpperCase();
        for (Map.Entry<String, List<String>> entry : DRUG_CLASS_MAPPING.entrySet()) {
            for (String kw : entry.getValue()) {
                if (m.contains(kw)) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private boolean isClass(String detectedClass, String medName, String targetClass) {
        if (targetClass.equalsIgnoreCase(detectedClass)) return true;
        String cls = findDrugClass(medName);
        return targetClass.equalsIgnoreCase(cls);
    }

    private void logAlert(String username, String role, Long patientId, String details) {
        if (auditService != null) {
            auditService.logAction(username, role, "ERX_ALERT", "SAFETY_CHECK", String.valueOf(patientId), details);
        }
    }
}
