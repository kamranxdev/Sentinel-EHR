package com.sentinel.imaging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "imaging_series", schema = "imaging")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ImagingSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_id", nullable = false)
    private ImagingStudy study;

    @Column(name = "series_instance_uid", unique = true, length = 255)
    private String seriesInstanceUid;

    @Column(length = 50)
    private String modality;

    @Column(name = "series_number")
    private Integer seriesNumber;

    @Column(length = 255)
    private String description;

    public ImagingSeries() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ImagingStudy getStudy() { return study; }
    public void setStudy(ImagingStudy study) { this.study = study; }

    public String getSeriesInstanceUid() { return seriesInstanceUid; }
    public void setSeriesInstanceUid(String seriesInstanceUid) { this.seriesInstanceUid = seriesInstanceUid; }

    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }

    public Integer getSeriesNumber() { return seriesNumber; }
    public void setSeriesNumber(Integer seriesNumber) { this.seriesNumber = seriesNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
