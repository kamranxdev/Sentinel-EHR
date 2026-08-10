package com.sentinel.patients.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.appointments.entity.Appointment;
import com.sentinel.appointments.repository.AppointmentRepository;
import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.clinicalrecords.entity.MedicalRecord;
import com.sentinel.clinicalrecords.repository.MedicalRecordRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.patients.dto.MPIMatchCandidateDTO;
import com.sentinel.patients.dto.MPIMergeRequestDTO;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.entity.PatientAssignment;
import com.sentinel.patients.repository.PatientAssignmentRepository;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.repository.VitalsRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class MPISearchService {

    private final PatientRepository patientRepository;
    private final AuditTrailService auditService;
    private final EncounterRepository encounterRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientAssignmentRepository patientAssignmentRepository;

    public MPISearchService(PatientRepository patientRepository,
                            AuditTrailService auditService,
                            EncounterRepository encounterRepository,
                            MedicalRecordRepository medicalRecordRepository,
                            PrescriptionRepository prescriptionRepository,
                            VitalsRepository vitalsRepository,
                            AllergyRepository allergyRepository,
                            DiagnosisRepository diagnosisRepository,
                            AppointmentRepository appointmentRepository,
                            PatientAssignmentRepository patientAssignmentRepository) {
        this.patientRepository = patientRepository;
        this.auditService = auditService;
        this.encounterRepository = encounterRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientAssignmentRepository = patientAssignmentRepository;
    }

    /**
     * Performs Fellegi-Sunter deterministic & probabilistic identity matching across Master Patient Index (MPI).
     * If query criteria are empty, defaults to automated candidate duplicate scanning across all records.
     */
    public List<MPIMatchCandidateDTO> searchMPI(String fullName,
                                                LocalDate dateOfBirth,
                                                String abhaId,
                                                String nationalId,
                                                String mrn,
                                                String phone,
                                                String email,
                                                String address,
                                                String gender,
                                                Authentication auth) {
        String cleanSearchName = fullName != null ? fullName.trim().toLowerCase() : "";
        String cleanSearchAbha = abhaId != null ? abhaId.replaceAll("[^0-9a-zA-Z]", "").toLowerCase() : "";
        String cleanSearchNational = nationalId != null ? nationalId.replaceAll("[^0-9a-zA-Z]", "").toLowerCase() : "";
        String cleanSearchMrn = mrn != null ? mrn.trim().toUpperCase() : "";
        String cleanSearchPhone = phone != null ? phone.replaceAll("[^0-9]", "") : "";
        String cleanSearchEmail = email != null ? email.trim().toLowerCase() : "";

        boolean isAllEmpty = cleanSearchName.isEmpty() && dateOfBirth == null && cleanSearchAbha.isEmpty()
                && cleanSearchNational.isEmpty() && cleanSearchMrn.isEmpty() && cleanSearchPhone.isEmpty()
                && cleanSearchEmail.isEmpty() && (gender == null || gender.trim().isEmpty());

        if (isAllEmpty) {
            return scanDuplicateCandidates(auth);
        }

        auditService.logAction(auth, "MPI_SEARCH", "PATIENT_MPI", "0",
                String.format("MPI Search query: Name='%s', DOB='%s', ABHA='%s', NationalID='%s', MRN='%s'",
                        fullName, dateOfBirth, abhaId, nationalId, mrn));

        List<Patient> allPatients = patientRepository.findAll();
        List<MPIMatchCandidateDTO> candidates = new ArrayList<>();

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

            // 2. ABHA ID / National ID Match (Deterministic / High Confidence 40%-45%)
            if (!cleanSearchAbha.isEmpty() && p.getAbhaId() != null) {
                String patientAbha = p.getAbhaId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
                if (patientAbha.equalsIgnoreCase(cleanSearchAbha)) {
                    totalScore += 45.0;
                    matchingFields.add("ABHA Health ID");
                } else {
                    conflictingFields.add("ABHA Health ID");
                }
            }

            if (!cleanSearchNational.isEmpty() && p.getNationalId() != null) {
                String patientNational = p.getNationalId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
                if (patientNational.equalsIgnoreCase(cleanSearchNational)) {
                    totalScore += 40.0;
                    matchingFields.add("National ID");
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
                String classification = getMatchClassification(finalScore);
                candidates.add(new MPIMatchCandidateDTO(p, finalScore, classification, matchingFields, conflictingFields));
            }
        }

        candidates.sort(Comparator.comparingDouble(MPIMatchCandidateDTO::getMatchScore).reversed());
        return candidates;
    }

    /**
     * Scans the system for potential duplicate patient chart pairs using Fellegi-Sunter algorithm.
     */
    public List<MPIMatchCandidateDTO> scanDuplicateCandidates(Authentication auth) {
        auditService.logAction(auth, "MPI_DUPLICATE_SCAN", "PATIENT_MPI", "0", "Executed system-wide duplicate chart scan.");
        List<Patient> allPatients = patientRepository.findAll();
        List<MPIMatchCandidateDTO> candidates = new ArrayList<>();

        for (int i = 0; i < allPatients.size(); i++) {
            Patient p1 = allPatients.get(i);
            for (int j = i + 1; j < allPatients.size(); j++) {
                Patient p2 = allPatients.get(j);

                double score = scorePatientPair(p1, p2);
                if (score >= 40.0) {
                    List<String> matching = getMatchingFields(p1, p2);
                    List<String> conflicting = getConflictingFields(p1, p2);
                    String classification = getMatchClassification(score);

                    candidates.add(new MPIMatchCandidateDTO(p2, score, classification, matching, conflicting));
                }
            }
        }

        candidates.sort(Comparator.comparingDouble(MPIMatchCandidateDTO::getMatchScore).reversed());
        return candidates;
    }

    /**
     * Performs a full, real transactional chart merge by re-linking all child records (Encounters, Medical Records,
     * Prescriptions, Vitals, Allergies, Diagnoses, Appointments, Assignments) from duplicate patient to primary patient,
     * consolidating demographics, and deleting duplicate record to maintain a unified Master Patient Index (MPI).
     */
    @Transactional
    public String requestChartMerge(MPIMergeRequestDTO mergeRequest, Authentication auth) {
        if (mergeRequest.getPrimaryPatientId() == null || mergeRequest.getDuplicatePatientId() == null) {
            throw new IllegalArgumentException("Primary patient ID and Duplicate patient ID must both be specified.");
        }
        if (mergeRequest.getPrimaryPatientId().equals(mergeRequest.getDuplicatePatientId())) {
            throw new IllegalArgumentException("Primary patient ID and Duplicate patient ID cannot be identical.");
        }

        Patient primary = patientRepository.findById(mergeRequest.getPrimaryPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary patient record #" + mergeRequest.getPrimaryPatientId() + " not found"));
        Patient duplicate = patientRepository.findById(mergeRequest.getDuplicatePatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Duplicate patient record #" + mergeRequest.getDuplicatePatientId() + " not found"));

        // 1. Re-link all child clinical entities from duplicate to primary patient
        List<Encounter> encounters = encounterRepository.findByPatientIdOrderByEncounterDateDesc(duplicate.getId());
        for (Encounter e : encounters) {
            e.setPatient(primary);
            encounterRepository.save(e);
        }

        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(duplicate.getId());
        for (MedicalRecord r : records) {
            r.setPatient(primary);
            medicalRecordRepository.save(r);
        }

        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(duplicate.getId());
        for (Prescription pr : prescriptions) {
            pr.setPatient(primary);
            prescriptionRepository.save(pr);
        }

        List<Vitals> vitalsList = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(duplicate.getId());
        for (Vitals v : vitalsList) {
            v.setPatient(primary);
            vitalsRepository.save(v);
        }

        List<Allergy> allergies = allergyRepository.findByPatientIdOrderByRecordedAtDesc(duplicate.getId());
        for (Allergy a : allergies) {
            a.setPatient(primary);
            allergyRepository.save(a);
        }

        List<Diagnosis> diagnoses = diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(duplicate.getId());
        for (Diagnosis d : diagnoses) {
            d.setPatient(primary);
            diagnosisRepository.save(d);
        }

        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(duplicate.getId());
        for (Appointment appt : appointments) {
            appt.setPatient(primary);
            appointmentRepository.save(appt);
        }

        List<PatientAssignment> assignments = patientAssignmentRepository.findByPatientId(duplicate.getId());
        for (PatientAssignment pa : assignments) {
            pa.setPatient(primary);
            patientAssignmentRepository.save(pa);
        }

        // 2. Consolidate patient demographics & clinical history
        consolidateDemographicsAndMedicalHistory(primary, duplicate);

        // 3. Re-assign user account link if primary has no user attached
        if (duplicate.getUser() != null) {
            if (primary.getUser() == null) {
                primary.setUser(duplicate.getUser());
            }
            duplicate.setUser(null);
        }

        patientRepository.save(primary);

        String dupCode = duplicate.getPatientCode();
        String primaryCode = primary.getPatientCode();

        // 4. Remove duplicate patient entity
        patientRepository.delete(duplicate);

        int totalMergedCount = encounters.size() + records.size() + prescriptions.size() +
                vitalsList.size() + allergies.size() + diagnoses.size() + appointments.size() + assignments.size();

        auditService.logAction(auth, "MPI_CHART_MERGE", "PATIENT_MPI",
                String.valueOf(primary.getId()),
                String.format("Completed MPI chart merge: Primary MRN=%s, Duplicate MRN=%s. Transferred %d total clinical entities (Encounters: %d, Records: %d, eRx: %d, Vitals: %d, Allergies: %d, Diagnoses: %d, Appts: %d). Rationale: %s",
                        primaryCode, dupCode, totalMergedCount, encounters.size(), records.size(), prescriptions.size(),
                        vitalsList.size(), allergies.size(), diagnoses.size(), appointments.size(), mergeRequest.getMergeReason()));

        return String.format("Successfully merged Duplicate Chart (MRN: %s) into Primary Master Chart (MRN: %s). Re-linked %d clinical records and updated audit trail.",
                dupCode, primaryCode, totalMergedCount);
    }

    private void consolidateDemographicsAndMedicalHistory(Patient primary, Patient duplicate) {
        if (isStringEmpty(primary.getAbhaId()) && !isStringEmpty(duplicate.getAbhaId())) primary.setAbhaId(duplicate.getAbhaId());
        if (isStringEmpty(primary.getNationalId()) && !isStringEmpty(duplicate.getNationalId())) primary.setNationalId(duplicate.getNationalId());
        if (isStringEmpty(primary.getPhone()) && !isStringEmpty(duplicate.getPhone())) primary.setPhone(duplicate.getPhone());
        if (isStringEmpty(primary.getEmail()) && !isStringEmpty(duplicate.getEmail())) primary.setEmail(duplicate.getEmail());
        if (isStringEmpty(primary.getAddress()) && !isStringEmpty(duplicate.getAddress())) primary.setAddress(duplicate.getAddress());
        if (isStringEmpty(primary.getPinCode()) && !isStringEmpty(duplicate.getPinCode())) primary.setPinCode(duplicate.getPinCode());
        if (isStringEmpty(primary.getEmergencyContact()) && !isStringEmpty(duplicate.getEmergencyContact())) primary.setEmergencyContact(duplicate.getEmergencyContact());
        if (isStringEmpty(primary.getBloodType()) && !isStringEmpty(duplicate.getBloodType())) primary.setBloodType(duplicate.getBloodType());
        if (isStringEmpty(primary.getGender()) && !isStringEmpty(duplicate.getGender())) primary.setGender(duplicate.getGender());

        if (isStringEmpty(primary.getInsuranceProvider()) && !isStringEmpty(duplicate.getInsuranceProvider())) {
            primary.setInsuranceProvider(duplicate.getInsuranceProvider());
            primary.setInsurancePolicyNumber(duplicate.getInsurancePolicyNumber());
            primary.setInsuranceGroupNumber(duplicate.getInsuranceGroupNumber());
            primary.setCoveragePlan(duplicate.getCoveragePlan());
        }

        primary.setMedicalAlerts(combineNotes(primary.getMedicalAlerts(), duplicate.getMedicalAlerts()));
        primary.setFoodAllergies(combineNotes(primary.getFoodAllergies(), duplicate.getFoodAllergies()));
        primary.setPastMedicalHistory(combineNotes(primary.getPastMedicalHistory(), duplicate.getPastMedicalHistory()));
        primary.setSeriousConditions(combineNotes(primary.getSeriousConditions(), duplicate.getSeriousConditions()));
        primary.setSurgeriesAndProcedures(combineNotes(primary.getSurgeriesAndProcedures(), duplicate.getSurgeriesAndProcedures()));
        primary.setFamilyMedicalHistory(combineNotes(primary.getFamilyMedicalHistory(), duplicate.getFamilyMedicalHistory()));
    }

    private boolean isStringEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private String combineNotes(String base, String addition) {
        if (isStringEmpty(base)) return addition;
        if (isStringEmpty(addition)) return base;
        if (base.contains(addition)) return base;
        return base + " | Merged: " + addition;
    }

    private double scorePatientPair(Patient p1, Patient p2) {
        double score = 0.0;
        if (p1.getFullName() != null && p2.getFullName() != null) {
            double nameSim = calculateJaroWinklerSimilarity(p1.getFullName().trim().toLowerCase(), p2.getFullName().trim().toLowerCase());
            if (nameSim >= 0.95) score += 35.0;
            else if (nameSim >= 0.80) score += 25.0;
            else if (nameSim >= 0.60) score += 15.0;
        }

        if (p1.getDateOfBirth() != null && p2.getDateOfBirth() != null && p1.getDateOfBirth().equals(p2.getDateOfBirth())) {
            score += 25.0;
        }

        if (!isStringEmpty(p1.getPhone()) && !isStringEmpty(p2.getPhone())) {
            String ph1 = p1.getPhone().replaceAll("[^0-9]", "");
            String ph2 = p2.getPhone().replaceAll("[^0-9]", "");
            if (!ph1.isEmpty() && ph1.equals(ph2)) score += 15.0;
        }

        if (!isStringEmpty(p1.getAbhaId()) && !isStringEmpty(p2.getAbhaId())) {
            String a1 = p1.getAbhaId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
            String a2 = p2.getAbhaId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
            if (!a1.isEmpty() && a1.equals(a2)) score += 45.0;
        }

        if (!isStringEmpty(p1.getNationalId()) && !isStringEmpty(p2.getNationalId())) {
            String n1 = p1.getNationalId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
            String n2 = p2.getNationalId().replaceAll("[^0-9a-zA-Z]", "").toLowerCase();
            if (!n1.isEmpty() && n1.equals(n2)) score += 40.0;
        }

        if (!isStringEmpty(p1.getEmail()) && !isStringEmpty(p2.getEmail()) && p1.getEmail().equalsIgnoreCase(p2.getEmail())) {
            score += 10.0;
        }

        if (p1.getGender() != null && p2.getGender() != null && p1.getGender().equalsIgnoreCase(p2.getGender())) {
            score += 5.0;
        }

        return Math.min(100.0, score);
    }

    private List<String> getMatchingFields(Patient p1, Patient p2) {
        List<String> list = new ArrayList<>();
        if (p1.getFullName() != null && p2.getFullName() != null) {
            double sim = calculateJaroWinklerSimilarity(p1.getFullName().trim().toLowerCase(), p2.getFullName().trim().toLowerCase());
            if (sim >= 0.80) list.add("Full Name (" + (int)(sim*100) + "% similarity)");
        }
        if (p1.getDateOfBirth() != null && p2.getDateOfBirth() != null && p1.getDateOfBirth().equals(p2.getDateOfBirth())) {
            list.add("Date of Birth");
        }
        if (!isStringEmpty(p1.getPhone()) && !isStringEmpty(p2.getPhone()) && p1.getPhone().replaceAll("[^0-9]", "").equals(p2.getPhone().replaceAll("[^0-9]", ""))) {
            list.add("Phone Number");
        }
        if (!isStringEmpty(p1.getAbhaId()) && !isStringEmpty(p2.getAbhaId()) && p1.getAbhaId().equalsIgnoreCase(p2.getAbhaId())) {
            list.add("ABHA Health ID");
        }
        if (!isStringEmpty(p1.getNationalId()) && !isStringEmpty(p2.getNationalId()) && p1.getNationalId().equalsIgnoreCase(p2.getNationalId())) {
            list.add("National ID");
        }
        if (!isStringEmpty(p1.getEmail()) && !isStringEmpty(p2.getEmail()) && p1.getEmail().equalsIgnoreCase(p2.getEmail())) {
            list.add("Email Address");
        }
        return list;
    }

    private List<String> getConflictingFields(Patient p1, Patient p2) {
        List<String> list = new ArrayList<>();
        if (p1.getDateOfBirth() != null && p2.getDateOfBirth() != null && !p1.getDateOfBirth().equals(p2.getDateOfBirth())) {
            list.add("Date of Birth");
        }
        if (!isStringEmpty(p1.getAbhaId()) && !isStringEmpty(p2.getAbhaId()) && !p1.getAbhaId().equalsIgnoreCase(p2.getAbhaId())) {
            list.add("ABHA Health ID");
        }
        if (!isStringEmpty(p1.getNationalId()) && !isStringEmpty(p2.getNationalId()) && !p1.getNationalId().equalsIgnoreCase(p2.getNationalId())) {
            list.add("National ID");
        }
        return list;
    }

    private String getMatchClassification(double score) {
        if (score >= 90.0) return "EXACT_MATCH";
        if (score >= 75.0) return "HIGH_PROBABILITY_MATCH";
        if (score >= 55.0) return "POSSIBLE_DUPLICATE";
        return "LOW_PROBABILITY";
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
