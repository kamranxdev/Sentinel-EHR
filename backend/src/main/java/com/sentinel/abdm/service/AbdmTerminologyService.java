package com.sentinel.abdm.service;

import org.hl7.fhir.r4.model.Coding;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AbdmTerminologyService {

    public static final String SNOMED_CT_SYSTEM = "http://snomed.info/sct";
    public static final String LOINC_SYSTEM = "http://loinc.org";
    public static final String ICD_10_SYSTEM = "http://hl7.org/fhir/sid/icd-10";

    private final Map<String, String> commonDiagnosisSnomedMap = Map.of(
            "E11.9", "44054006",   // Type 2 Diabetes Mellitus
            "I10", "38341003",     // Essential Hypertension
            "J45.909", "195967001",// Asthma
            "J18.9", "233604007"   // Pneumonia
    );

    public Coding getSnomedCoding(String snomedCode, String display) {
        return new Coding(SNOMED_CT_SYSTEM, snomedCode, display);
    }

    public Coding getLoincCoding(String loincCode, String display) {
        return new Coding(LOINC_SYSTEM, loincCode, display);
    }

    public Coding getIcd10Coding(String icdCode, String display) {
        return new Coding(ICD_10_SYSTEM, icdCode, display);
    }

    public String mapIcdToSnomed(String icdCode) {
        return commonDiagnosisSnomedMap.getOrDefault(icdCode, "404684003"); // Default: Clinical finding
    }
}
