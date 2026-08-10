package com.sentinel.patients.dto;

import com.sentinel.patients.entity.Patient;
import java.util.List;

public class MPIMatchCandidateDTO {
    private Patient patient;
    private double matchScore; // 0 - 100%
    private String matchClassification; // EXACT_MATCH, HIGH_PROBABILITY_MATCH, POSSIBLE_DUPLICATE, NO_MATCH
    private List<String> matchingFields; // e.g. ["Name", "DOB", "Phone"]
    private List<String> conflictingFields; // e.g. ["Address"]

    public MPIMatchCandidateDTO() {
    }

    public MPIMatchCandidateDTO(Patient patient, double matchScore, String matchClassification,
            List<String> matchingFields, List<String> conflictingFields) {
        this.patient = patient;
        this.matchScore = matchScore;
        this.matchClassification = matchClassification;
        this.matchingFields = matchingFields;
        this.conflictingFields = conflictingFields;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(double matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchClassification() {
        return matchClassification;
    }

    public void setMatchClassification(String matchClassification) {
        this.matchClassification = matchClassification;
    }

    public List<String> getMatchingFields() {
        return matchingFields;
    }

    public void setMatchingFields(List<String> matchingFields) {
        this.matchingFields = matchingFields;
    }

    public List<String> getConflictingFields() {
        return conflictingFields;
    }

    public void setConflictingFields(List<String> conflictingFields) {
        this.conflictingFields = conflictingFields;
    }
}
