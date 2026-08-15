package com.sentinel.patients.dto;

import java.time.LocalDateTime;

public class CopayCollectionDTO {
    private Long appointmentId;
    private Long patientId;
    private double amountCollected;
    private String paymentMethod;
    private String receiptNumber;
    private String collectedBy;
    private LocalDateTime collectionTimestamp;
    private String notes;

    public CopayCollectionDTO() {}

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public double getAmountCollected() { return amountCollected; }
    public void setAmountCollected(double amountCollected) { this.amountCollected = amountCollected; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getCollectedBy() { return collectedBy; }
    public void setCollectedBy(String collectedBy) { this.collectedBy = collectedBy; }

    public LocalDateTime getCollectionTimestamp() { return collectionTimestamp; }
    public void setCollectionTimestamp(LocalDateTime collectionTimestamp) { this.collectionTimestamp = collectionTimestamp; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
