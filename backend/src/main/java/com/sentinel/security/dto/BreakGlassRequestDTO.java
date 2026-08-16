package com.sentinel.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class BreakGlassRequestDTO {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private String category = "CROSS_COVERAGE_EMERGENCY";

    @NotBlank(message = "Clinical justification is required")
    private String justification;
    
    private String username;

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
