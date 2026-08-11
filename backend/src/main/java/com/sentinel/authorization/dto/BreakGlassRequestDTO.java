package com.sentinel.authorization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BreakGlassRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String category = "CROSS_COVERAGE_EMERGENCY";

    @NotBlank(message = "Clinical justification is required")
    private String justification;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
}
