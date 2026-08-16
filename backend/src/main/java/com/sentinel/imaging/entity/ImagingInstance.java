package com.sentinel.imaging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "imaging_instances", schema = "imaging")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ImagingInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "series_id", nullable = false)
    private ImagingSeries series;

    @Column(name = "sop_instance_uid", unique = true, length = 255)
    private String sopInstanceUid;

    @Column(name = "instance_number")
    private Integer instanceNumber;

    @Column(name = "object_reference", columnDefinition = "TEXT")
    private String objectReference;

    public ImagingInstance() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ImagingSeries getSeries() { return series; }
    public void setSeries(ImagingSeries series) { this.series = series; }

    public String getSopInstanceUid() { return sopInstanceUid; }
    public void setSopInstanceUid(String sopInstanceUid) { this.sopInstanceUid = sopInstanceUid; }

    public Integer getInstanceNumber() { return instanceNumber; }
    public void setInstanceNumber(Integer instanceNumber) { this.instanceNumber = instanceNumber; }

    public String getObjectReference() { return objectReference; }
    public void setObjectReference(String objectReference) { this.objectReference = objectReference; }
}
