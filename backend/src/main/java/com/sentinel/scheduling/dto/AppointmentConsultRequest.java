package com.sentinel.scheduling.dto;

public class AppointmentConsultRequest {
    private String diagnosis;
    private String icdCode;
    private String treatmentNotes;

    public AppointmentConsultRequest() {}

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getIcdCode() { return icdCode; }
    public void setIcdCode(String icdCode) { this.icdCode = icdCode; }
    public String getTreatmentNotes() { return treatmentNotes; }
    public void setTreatmentNotes(String treatmentNotes) { this.treatmentNotes = treatmentNotes; }
}
