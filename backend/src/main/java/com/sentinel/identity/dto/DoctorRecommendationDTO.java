package com.sentinel.identity.dto;

import java.util.UUID;

public class DoctorRecommendationDTO {
    private UUID doctorId;
    private String doctorName;
    private String specialty;
    private double matchScore;
    private String recommendationReason;

    public DoctorRecommendationDTO() {}

    public DoctorRecommendationDTO(UUID doctorId, String doctorName, String specialty, double matchScore, String recommendationReason) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialty = specialty;
        this.matchScore = matchScore;
        this.recommendationReason = recommendationReason;
    }

    public UUID getDoctorId() { return doctorId; }
    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getRecommendationReason() { return recommendationReason; }
    public void setRecommendationReason(String recommendationReason) { this.recommendationReason = recommendationReason; }
}
