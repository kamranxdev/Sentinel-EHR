package com.sentinel.imaging.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CreateImagingOrderRequest {
    @NotBlank(message = "Modality is required")
    private String modality;
    @NotBlank(message = "Procedure name is required")
    private String procedureName;
    private String cptCode;
    private LocalDateTime scheduledAt;

    public CreateImagingOrderRequest() {}

    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public String getProcedureName() { return procedureName; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }
    public String getCptCode() { return cptCode; }
    public void setCptCode(String cptCode) { this.cptCode = cptCode; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
}
