package com.sentinel.patient.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CopayCollectionDTO {
    private UUID appointmentId;
    private UUID patientId;
    private double amountCollected;
    private String paymentMethod;
    private String receiptNumber;
    private String collectedBy;
    private OffsetDateTime collectionTimestamp;
    private String notes;

    public CopayCollectionDTO() {}

    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public double getAmountCollected() { return amountCollected; }
    public void setAmountCollected(double amountCollected) { this.amountCollected = amountCollected; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getCollectedBy() { return collectedBy; }
    public void setCollectedBy(String collectedBy) { this.collectedBy = collectedBy; }

    public OffsetDateTime getCollectionTimestamp() { return collectionTimestamp; }
    public void setCollectionTimestamp(OffsetDateTime collectionTimestamp) { this.collectionTimestamp = collectionTimestamp; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
