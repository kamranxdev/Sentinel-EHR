package com.sentinel.imaging.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ImagingStudyResponseDTO {
    private UUID id;
    private UUID patientId;
    private Long imagingOrderId;
    private String accessionNumber;
    private String studyInstanceUid;
    private String modality;
    private OffsetDateTime performedAt;
    private String pacsReference;
    private String status;

    public ImagingStudyResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public Long getImagingOrderId() { return imagingOrderId; }
    public void setImagingOrderId(Long imagingOrderId) { this.imagingOrderId = imagingOrderId; }
    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }
    public String getStudyInstanceUid() { return studyInstanceUid; }
    public void setStudyInstanceUid(String studyInstanceUid) { this.studyInstanceUid = studyInstanceUid; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public OffsetDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(OffsetDateTime performedAt) { this.performedAt = performedAt; }
    public String getPacsReference() { return pacsReference; }
    public void setPacsReference(String pacsReference) { this.pacsReference = pacsReference; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
