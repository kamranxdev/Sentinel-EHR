package com.sentinel.imaging.dto;

import java.util.UUID;

public class ImagingSeriesResponseDTO {
    private UUID id;
    private UUID studyId;
    private String seriesInstanceUid;
    private String modality;
    private Integer seriesNumber;
    private String description;

    public ImagingSeriesResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getStudyId() { return studyId; }
    public void setStudyId(UUID studyId) { this.studyId = studyId; }
    public String getSeriesInstanceUid() { return seriesInstanceUid; }
    public void setSeriesInstanceUid(String seriesInstanceUid) { this.seriesInstanceUid = seriesInstanceUid; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public Integer getSeriesNumber() { return seriesNumber; }
    public void setSeriesNumber(Integer seriesNumber) { this.seriesNumber = seriesNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
