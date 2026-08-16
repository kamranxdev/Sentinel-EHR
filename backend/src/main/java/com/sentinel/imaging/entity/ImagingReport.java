package com.sentinel.imaging.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.Practitioner;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "imaging_reports", schema = "imaging")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ImagingReport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_id", nullable = false)
    private ImagingStudy study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "radiologist_id")
    private Practitioner radiologist;

    @Column(name = "report_status", nullable = false, length = 30)
    private String reportStatus = "DRAFT";

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(columnDefinition = "TEXT")
    private String impression;

    @Column(name = "reported_at")
    private OffsetDateTime reportedAt;

    public ImagingReport() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ImagingStudy getStudy() { return study; }
    public void setStudy(ImagingStudy study) { this.study = study; }

    public Practitioner getRadiologist() { return radiologist; }
    public void setRadiologist(Practitioner radiologist) { this.radiologist = radiologist; }

    public String getReportStatus() { return reportStatus; }
    public void setReportStatus(String reportStatus) { this.reportStatus = reportStatus; }

    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }

    public String getImpression() { return impression; }
    public void setImpression(String impression) { this.impression = impression; }

    public OffsetDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(OffsetDateTime reportedAt) { this.reportedAt = reportedAt; }
}
