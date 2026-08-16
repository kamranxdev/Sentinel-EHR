package com.sentinel.imaging.dto;

import java.util.UUID;

public class CreateImagingSeriesRequest {
    private String seriesInstanceUid;
    private String modality;
    private Integer seriesNumber;
    private String description;

    public CreateImagingSeriesRequest() {}

    public String getSeriesInstanceUid() { return seriesInstanceUid; }
    public void setSeriesInstanceUid(String seriesInstanceUid) { this.seriesInstanceUid = seriesInstanceUid; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public Integer getSeriesNumber() { return seriesNumber; }
    public void setSeriesNumber(Integer seriesNumber) { this.seriesNumber = seriesNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
