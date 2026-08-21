package com.sentinel.scheduling.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AppointmentBillingResponseDTO {
    private UUID id;
    private UUID appointmentId;
    private Double consultationFee;
    private Double triageFee;
    private Double labFee;
    private Double pharmacyFee;
    private Double insuranceCoverage;
    private Double netPayable;
    private String paymentStatus;
    private OffsetDateTime generatedAt;

    public AppointmentBillingResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public Double getTriageFee() { return triageFee; }
    public void setTriageFee(Double triageFee) { this.triageFee = triageFee; }

    public Double getLabFee() { return labFee; }
    public void setLabFee(Double labFee) { this.labFee = labFee; }

    public Double getPharmacyFee() { return pharmacyFee; }
    public void setPharmacyFee(Double pharmacyFee) { this.pharmacyFee = pharmacyFee; }

    public Double getInsuranceCoverage() { return insuranceCoverage; }
    public void setInsuranceCoverage(Double insuranceCoverage) { this.insuranceCoverage = insuranceCoverage; }

    public Double getNetPayable() { return netPayable; }
    public void setNetPayable(Double netPayable) { this.netPayable = netPayable; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public OffsetDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(OffsetDateTime generatedAt) { this.generatedAt = generatedAt; }
}
