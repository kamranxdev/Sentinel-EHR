package com.sentinel.scheduling.dto;

public class BillingGenerationRequestDTO {
    private Double consultationFee;
    private Double triageFee;
    private Double labFee;
    private Double pharmacyFee;
    private Double insuranceCoverage;

    public BillingGenerationRequestDTO() {}

    public Double getConsultationFee() {
        return consultationFee != null ? consultationFee : 100.0;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Double getTriageFee() {
        return triageFee != null ? triageFee : 25.0;
    }

    public void setTriageFee(Double triageFee) {
        this.triageFee = triageFee;
    }

    public Double getLabFee() {
        return labFee != null ? labFee : 0.0;
    }

    public void setLabFee(Double labFee) {
        this.labFee = labFee;
    }

    public Double getPharmacyFee() {
        return pharmacyFee != null ? pharmacyFee : 0.0;
    }

    public void setPharmacyFee(Double pharmacyFee) {
        this.pharmacyFee = pharmacyFee;
    }

    public Double getInsuranceCoverage() {
        return insuranceCoverage != null ? insuranceCoverage : 0.0;
    }

    public void setInsuranceCoverage(Double insuranceCoverage) {
        this.insuranceCoverage = insuranceCoverage;
    }
}
