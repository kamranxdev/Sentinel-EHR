package com.sentinel.procedure.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CreateProcedureOrderRequest {
    @NotBlank(message = "Procedure name is required")
    private String procedureName;
    private String snomedCode;
    private String cptCode;
    private LocalDateTime scheduledAt;

    public CreateProcedureOrderRequest() {}

    public String getProcedureName() { return procedureName; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }
    public String getSnomedCode() { return snomedCode; }
    public void setSnomedCode(String snomedCode) { this.snomedCode = snomedCode; }
    public String getCptCode() { return cptCode; }
    public void setCptCode(String cptCode) { this.cptCode = cptCode; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
}
