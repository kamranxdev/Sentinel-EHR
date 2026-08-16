package com.sentinel.scheduling.dto;

public class CheckInRequestDTO {
    private Boolean insuranceVerified;
    private String insuranceDetails;
    private String reportsUploaded;
    private String note;

    public CheckInRequestDTO() {}

    public CheckInRequestDTO(Boolean insuranceVerified, String insuranceDetails, String reportsUploaded, String note) {
        this.insuranceVerified = insuranceVerified;
        this.insuranceDetails = insuranceDetails;
        this.reportsUploaded = reportsUploaded;
        this.note = note;
    }

    public Boolean getInsuranceVerified() {
        return insuranceVerified;
    }

    public void setInsuranceVerified(Boolean insuranceVerified) {
        this.insuranceVerified = insuranceVerified;
    }

    public String getInsuranceDetails() {
        return insuranceDetails;
    }

    public void setInsuranceDetails(String insuranceDetails) {
        this.insuranceDetails = insuranceDetails;
    }

    public String getReportsUploaded() {
        return reportsUploaded;
    }

    public void setReportsUploaded(String reportsUploaded) {
        this.reportsUploaded = reportsUploaded;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
