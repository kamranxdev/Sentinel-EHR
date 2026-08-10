package com.sentinel.appointments.dto;

import java.time.LocalDateTime;

public class AppointmentBillingResponseDTO {

    private Long id;
    private Long appointmentId;
    private Double consultationFee;
    private Double triageFee;
    private Double labFee;
    private Double pharmacyFee;
    private Double insuranceCoverage;
    private Double netPayable;
    private String paymentStatus;
    private LocalDateTime generatedAt;

    public AppointmentBillingResponseDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Double getTriageFee() {
        return triageFee;
    }

    public void setTriageFee(Double triageFee) {
        this.triageFee = triageFee;
    }

    public Double getLabFee() {
        return labFee;
    }

    public void setLabFee(Double labFee) {
        this.labFee = labFee;
    }

    public Double getPharmacyFee() {
        return pharmacyFee;
    }

    public void setPharmacyFee(Double pharmacyFee) {
        this.pharmacyFee = pharmacyFee;
    }

    public Double getInsuranceCoverage() {
        return insuranceCoverage;
    }

    public void setInsuranceCoverage(Double insuranceCoverage) {
        this.insuranceCoverage = insuranceCoverage;
    }

    public Double getNetPayable() {
        return netPayable;
    }

    public void setNetPayable(Double netPayable) {
        this.netPayable = netPayable;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
