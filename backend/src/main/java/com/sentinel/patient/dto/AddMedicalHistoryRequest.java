package com.sentinel.patient.dto;

public class AddMedicalHistoryRequest {
    private String pastMedicalHistory;
    private String pastSurgicalHistory;
    private String familyHistory;
    private String socialHistory;

    public AddMedicalHistoryRequest() {}

    public String getPastMedicalHistory() { return pastMedicalHistory; }
    public void setPastMedicalHistory(String pastMedicalHistory) { this.pastMedicalHistory = pastMedicalHistory; }
    public String getPastSurgicalHistory() { return pastSurgicalHistory; }
    public void setPastSurgicalHistory(String pastSurgicalHistory) { this.pastSurgicalHistory = pastSurgicalHistory; }
    public String getFamilyHistory() { return familyHistory; }
    public void setFamilyHistory(String familyHistory) { this.familyHistory = familyHistory; }
    public String getSocialHistory() { return socialHistory; }
    public void setSocialHistory(String socialHistory) { this.socialHistory = socialHistory; }
}
