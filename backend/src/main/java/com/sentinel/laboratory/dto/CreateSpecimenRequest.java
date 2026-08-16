package com.sentinel.laboratory.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.UUID;

public class CreateSpecimenRequest {
    @NotBlank(message = "Specimen type is required")
    private String specimenType;
    private String accessionNumber;
    private String barcode;
    private String collectionMethod;
    private String collectionSite;
    private String container;
    private OffsetDateTime collectedAt;

    public CreateSpecimenRequest() {}

    public String getSpecimenType() { return specimenType; }
    public void setSpecimenType(String specimenType) { this.specimenType = specimenType; }
    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getCollectionMethod() { return collectionMethod; }
    public void setCollectionMethod(String collectionMethod) { this.collectionMethod = collectionMethod; }
    public String getCollectionSite() { return collectionSite; }
    public void setCollectionSite(String collectionSite) { this.collectionSite = collectionSite; }
    public String getContainer() { return container; }
    public void setContainer(String container) { this.container = container; }
    public OffsetDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(OffsetDateTime collectedAt) { this.collectedAt = collectedAt; }
}
