package com.sentinel.laboratory.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class SpecimenResponseDTO {
    private UUID id;
    private UUID patientId;
    private String specimenType;
    private String accessionNumber;
    private String barcode;
    private String status;
    private OffsetDateTime collectedAt;
    private OffsetDateTime receivedAt;
    private String collectedByUsername;

    public SpecimenResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getSpecimenType() { return specimenType; }
    public void setSpecimenType(String specimenType) { this.specimenType = specimenType; }
    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(OffsetDateTime collectedAt) { this.collectedAt = collectedAt; }
    public OffsetDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(OffsetDateTime receivedAt) { this.receivedAt = receivedAt; }
    public String getCollectedByUsername() { return collectedByUsername; }
    public void setCollectedByUsername(String collectedByUsername) { this.collectedByUsername = collectedByUsername; }
}
