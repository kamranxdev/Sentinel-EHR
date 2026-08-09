package com.sentinel.users.dto;

import com.sentinel.users.entity.User;
import java.util.List;

public class DoctorRecommendationDTO {
    private Long id;
    private User doctor;
    private String fullName;
    private String username;
    private String departmentName;
    private int matchScore;
    private int specialtyFitScore;
    private int continuityScore;
    private int workloadScore;
    private int urgencyScore;
    private String triageLevel;
    private String triageSummary;
    private String targetSpecialty;
    private String matchReason;
    private boolean verified;
    private List<String> rationaleList;
    private List<String> recommendedSlots;

    public DoctorRecommendationDTO() {}

    public DoctorRecommendationDTO(Long id, String fullName, String username, String departmentName, int matchScore, String matchReason) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.departmentName = departmentName;
        this.matchScore = matchScore;
        this.matchReason = matchReason;
    }

    public DoctorRecommendationDTO(User doctor, int matchScore, int specialtyFitScore, int continuityScore, int workloadScore,
                                   int urgencyScore, String triageLevel, String triageSummary, String targetSpecialty,
                                   String matchReason, boolean verified, List<String> rationaleList, List<String> recommendedSlots) {
        this.doctor = doctor;
        if (doctor != null) {
            this.id = doctor.getId();
            this.fullName = doctor.getFullName();
            this.username = doctor.getUsername();
            this.departmentName = doctor.getDepartment();
        }
        this.matchScore = matchScore;
        this.specialtyFitScore = specialtyFitScore;
        this.continuityScore = continuityScore;
        this.workloadScore = workloadScore;
        this.urgencyScore = urgencyScore;
        this.triageLevel = triageLevel;
        this.triageSummary = triageSummary;
        this.targetSpecialty = targetSpecialty;
        this.matchReason = matchReason;
        this.verified = verified;
        this.rationaleList = rationaleList;
        this.recommendedSlots = recommendedSlots;
    }

    public Long getId() {
        return id != null ? id : (doctor != null ? doctor.getId() : null);
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDoctor() {
        return doctor;
    }

    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }

    public String getFullName() {
        return fullName != null ? fullName : (doctor != null ? doctor.getFullName() : null);
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username != null ? username : (doctor != null ? doctor.getUsername() : null);
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDepartmentName() {
        return departmentName != null ? departmentName : (doctor != null ? doctor.getDepartment() : null);
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public int getSpecialtyFitScore() {
        return specialtyFitScore;
    }

    public void setSpecialtyFitScore(int specialtyFitScore) {
        this.specialtyFitScore = specialtyFitScore;
    }

    public int getContinuityScore() {
        return continuityScore;
    }

    public void setContinuityScore(int continuityScore) {
        this.continuityScore = continuityScore;
    }

    public int getWorkloadScore() {
        return workloadScore;
    }

    public void setWorkloadScore(int workloadScore) {
        this.workloadScore = workloadScore;
    }

    public int getUrgencyScore() {
        return urgencyScore;
    }

    public void setUrgencyScore(int urgencyScore) {
        this.urgencyScore = urgencyScore;
    }

    public String getTriageLevel() {
        return triageLevel;
    }

    public void setTriageLevel(String triageLevel) {
        this.triageLevel = triageLevel;
    }

    public String getTriageSummary() {
        return triageSummary;
    }

    public void setTriageSummary(String triageSummary) {
        this.triageSummary = triageSummary;
    }

    public String getTargetSpecialty() {
        return targetSpecialty;
    }

    public void setTargetSpecialty(String targetSpecialty) {
        this.targetSpecialty = targetSpecialty;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public List<String> getRationaleList() {
        return rationaleList;
    }

    public void setRationaleList(List<String> rationaleList) {
        this.rationaleList = rationaleList;
    }

    public List<String> getRecommendedSlots() {
        return recommendedSlots;
    }

    public void setRecommendedSlots(List<String> recommendedSlots) {
        this.recommendedSlots = recommendedSlots;
    }
}
