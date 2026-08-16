package com.sentinel.procedure.dto;

import java.time.OffsetDateTime;

public class PerformProcedureRequest {
    private String findings;
    private String complications;
    private OffsetDateTime performedAt;

    public PerformProcedureRequest() {}

    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getComplications() { return complications; }
    public void setComplications(String complications) { this.complications = complications; }
    public OffsetDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(OffsetDateTime performedAt) { this.performedAt = performedAt; }
}
