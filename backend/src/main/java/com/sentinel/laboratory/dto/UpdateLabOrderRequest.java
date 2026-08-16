package com.sentinel.laboratory.dto;

public class UpdateLabOrderRequest {
    private String status;
    private String specimenBarcode;
    private String clinicalNotes;

    public UpdateLabOrderRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSpecimenBarcode() { return specimenBarcode; }
    public void setSpecimenBarcode(String specimenBarcode) { this.specimenBarcode = specimenBarcode; }
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
}
