package com.sentinel.imaging.dto;

public class CreateImagingReportRequest {
    private String findings;
    private String impression;
    private String reportStatus;

    public CreateImagingReportRequest() {}

    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getImpression() { return impression; }
    public void setImpression(String impression) { this.impression = impression; }
    public String getReportStatus() { return reportStatus; }
    public void setReportStatus(String reportStatus) { this.reportStatus = reportStatus; }
}
