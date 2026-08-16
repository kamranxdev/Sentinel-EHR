package com.sentinel.imaging.dto;

import java.time.OffsetDateTime;

public class CreateImagingStudyRequest {
    private String accessionNumber;
    private String studyInstanceUid;
    private String modality;
    private String pacsReference;
    private OffsetDateTime performedAt;

    public CreateImagingStudyRequest() {}

    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }
    public String getStudyInstanceUid() { return studyInstanceUid; }
    public void setStudyInstanceUid(String studyInstanceUid) { this.studyInstanceUid = studyInstanceUid; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public String getPacsReference() { return pacsReference; }
    public void setPacsReference(String pacsReference) { this.pacsReference = pacsReference; }
    public OffsetDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(OffsetDateTime performedAt) { this.performedAt = performedAt; }
}
