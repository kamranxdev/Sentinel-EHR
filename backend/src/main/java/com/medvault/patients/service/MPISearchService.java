package com.medvault.patients.service;

import com.medvault.audit.service.AuditTrailService;
import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.patients.dto.MPIMatchCandidateDTO;
import com.medvault.patients.dto.MPIMergeRequestDTO;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MPISearchService {

    private final PatientRepository patientRepository;
    private final AuditTrailService auditService;

    public MPISearchService(PatientRepository patientRepository, AuditTrailService auditService) {
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    /**
     * Performs Fellegi-Sunter deterministic & probabilistic identity matching across Master Patient Index (MPI).
     */
    public List<MPIMatchCandidateDTO> searchMPI(String fullName,
                                                LocalDate dateOfBirth,
                                                String ssn,
                                                String mrn,
                                                String phone,
                                                String email,
                                                String address,
                                                String gender,
                                                Authentication auth) {
        auditService.logAction(auth, "MPI_SEARCH", "PATIENT_MPI", "0", 
            String.format("MPI Search query: Name='%s', DOB='%s', SSN='%s', MRN='%s'", 
                fullName, dateOfBirth, ssn != null ? "***" : null, mrn));

        List<Patient> allPatients = patientRepository.findAll();
        List<MPIMatchCandidateDTO> candidates = new ArrayList<>();

        String cleanSearchName = fullName != null ? fullName.trim().toLowerCase() : "";
        String cleanSearchSsn = ssn != null ? ssn.replaceAll("[^0-9]", "") : "";
        String cleanSearchMrn = mrn != null ? mrn.trim().toUpperCase() : "";
        String cleanSearchPhone = phone != null ? phone.replaceAll("[^0-9]", "") : "";
        String cleanSearchEmail = email != null ? email.trim().toLowerCase() : "";

        for (Patient p : allPatients) {
            double totalScore = 0.0;
            List<String> matchingFields = new ArrayList<>();
            List<String> conflictingFields = new ArrayList<>();

            // 1. MRN Exact Match (Deterministic 100%)
            if (!cleanSearchMrn.isEmpty() && p.getPatientCode() != null && p.getPatientCode().equalsIgnoreCase(cleanSearchMrn)) {
                matchingFields.add("MRN / Patient Code");
                candidates.add(new MPIMatchCandidateDTO(p, 100.0, "EXACT_MATCH", matchingFields, conflictingFields));
                continue;
            }

            // 2. ABHA ID / National ID / SSN Match (Deterministic / High Confidence 40%)
            if (p.getAbhaId() != null && !p.getAbhaId().isEmpty()) {
                String patientAbha = p.getAbhaId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
                String searchSsnOrAbha = (ssn != null ? ssn : "").replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
                if (!searchSsnOrAbha.isEmpty() && patientAbha.contains(searchSsnOrAbha)) {
                    totalScore += 45.0;
                    matchingFields.add("ABHA Health ID");
                }
            }

            if (!cleanSearchSsn.isEmpty() && p.getSsn() != null) {
                String patientSsn = p.getSsn().replaceAll("[^0-9]", "");
                if (patientSsn.equals(cleanSearchSsn)) {
                    totalScore += 40.0;
                    matchingFields.add("National ID / SSN");
                } else if (patientSsn.length() >= 4 && cleanSearchSsn.length() >= 4 &&
                        patientSsn.substring(patientSsn.length() - 4).equals(cleanSearchSsn.substring(cleanSearchSsn.length() - 4))) {
                    totalScore += 25.0;
                    matchingFields.add("National ID (Last 4)");
                } else {
                    conflictingFields.add("National ID");
                }
            }

            // 3. Full Name Match (Probabilistic up to 35%)
            if (!cleanSearchName.isEmpty() && p.getFullName() != null) {
                String pName = p.getFullName().trim().toLowerCase();
                double nameSim = calculateJaroWinklerSimilarity(cleanSearchName, pName);
                if (nameSim >= 0.95) {
                    totalScore += 35.0;
                    matchingFields.add("Full Name (Exact/Phonetic)");
                } else if (nameSim >= 0.80) {
                    totalScore += 25.0;
                    matchingFields.add("Full Name (High Similarity)");
                } else if (nameSim >= 0.60) {
                    totalScore += 15.0;
                    matchingFields.add("Full Name (Partial)");
                } else {
                    conflictingFields.add("Full Name");
                }
            }

            // 4. Date of Birth Match (25%)
            if (dateOfBirth != null && p.getDateOfBirth() != null) {
                if (dateOfBirth.equals(p.getDateOfBirth())) {
                    totalScore += 25.0;
                    matchingFields.add("Date of Birth");
                } else {
                    conflictingFields.add("Date of Birth");
                }
            }

            // 5. Phone Match (15%)
            if (!cleanSearchPhone.isEmpty() && p.getPhone() != null) {
                String pPhone = p.getPhone().replaceAll("[^0-9]", "");
                if (!pPhone.isEmpty() && pPhone.equals(cleanSearchPhone)) {
                    totalScore += 15.0;
                    matchingFields.add("Phone Number");
                }
            }

            // 6. Email Match (10%)
            if (!cleanSearchEmail.isEmpty() && p.getEmail() != null) {
                if (p.getEmail().trim().toLowerCase().equals(cleanSearchEmail)) {
                    totalScore += 10.0;
                    matchingFields.add("Email Address");
                }
            }

            // 7. Gender Match (5%)
            if (gender != null && p.getGender() != null) {
                if (gender.equalsIgnoreCase(p.getGender())) {
                    totalScore += 5.0;
                    matchingFields.add("Gender");
                }
            }

            // Cap max score at 100.0
            double finalScore = Math.min(100.0, totalScore);

            if (finalScore >= 35.0) {
                String classification;
                if (finalScore >= 90.0) {
                    classification = "EXACT_MATCH";
                } else if (finalScore >= 75.0) {
                    classification = "HIGH_PROBABILITY_MATCH";
                } else if (finalScore >= 55.0) {
                    classification = "POSSIBLE_DUPLICATE";
                } else {
                    classification = "LOW_PROBABILITY";
                }

                candidates.add(new MPIMatchCandidateDTO(p, finalScore, classification, matchingFields, conflictingFields));
            }
        }

        candidates.sort(Comparator.comparingDouble(MPIMatchCandidateDTO::getMatchScore).reversed());
        return candidates;
    }

    @Transactional
    public String requestChartMerge(MPIMergeRequestDTO mergeRequest, Authentication auth) {
        Patient primary = patientRepository.findById(mergeRequest.getPrimaryPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary patient record #" + mergeRequest.getPrimaryPatientId() + " not found"));
        Patient duplicate = patientRepository.findById(mergeRequest.getDuplicatePatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Duplicate patient record #" + mergeRequest.getDuplicatePatientId() + " not found"));

        auditService.logAction(auth, "MPI_MERGE_REQUEST", "MPI_CHART_MERGE", 
            String.valueOf(primary.getId()), 
            String.format("Initiated MPI chart merge: Primary MRN=%s, Duplicate MRN=%s. Rationale: %s",
                primary.getPatientCode(), duplicate.getPatientCode(), mergeRequest.getMergeReason()));

        return String.format("Chart merge request submitted successfully for Primary MRN %s and Duplicate MRN %s. Audit Log ID created.",
                primary.getPatientCode(), duplicate.getPatientCode());
    }

    private double calculateJaroWinklerSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        int len1 = s1.length();
        int len2 = s2.length();
        if (len1 == 0 || len2 == 0) return 0.0;

        int matchDistance = Math.max(len1, len2) / 2 - 1;
        boolean[] s1Matches = new boolean[len1];
        boolean[] s2Matches = new boolean[len2];

        int matches = 0;
        for (int i = 0; i < len1; i++) {
            int start = Math.max(0, i - matchDistance);
            int end = Math.min(i + matchDistance + 1, len2);
            for (int j = start; j < end; j++) {
                if (s2Matches[j]) continue;
                if (s1.charAt(i) != s2.charAt(j)) continue;
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }

        if (matches == 0) return 0.0;

        double t = 0;
        int k = 0;
        for (int i = 0; i < len1; i++) {
            if (!s1Matches[i]) continue;
            while (!s2Matches[k]) k++;
            if (s1.charAt(i) != s2.charAt(k)) t += 0.5;
            k++;
        }

        double jaro = (((double) matches / len1) + ((double) matches / len2) + ((matches - t) / matches)) / 3.0;

        int pLength = 0;
        for (int i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
            if (s1.charAt(i) == s2.charAt(i)) pLength++;
            else break;
        }

        return jaro + pLength * 0.1 * (1 - jaro);
    }
}
