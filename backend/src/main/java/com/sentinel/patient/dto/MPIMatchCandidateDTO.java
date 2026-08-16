package com.sentinel.patient.dto;

import java.time.LocalDate;
import java.util.UUID;

public class MPIMatchCandidateDTO {
    private UUID id;
    private String patientCode;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private double matchScore;
    private String matchClassification;
    private String matchReason;

    public MPIMatchCandidateDTO() {}

    public MPIMatchCandidateDTO(UUID id, String patientCode, String fullName, LocalDate dateOfBirth, String gender, String phone, String email, String address, double matchScore, String matchClassification, String matchReason) {
        this.id = id;
        this.patientCode = patientCode;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.matchScore = matchScore;
        this.matchClassification = matchClassification;
        this.matchReason = matchReason;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getMatchClassification() { return matchClassification; }
    public void setMatchClassification(String matchClassification) { this.matchClassification = matchClassification; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
}
