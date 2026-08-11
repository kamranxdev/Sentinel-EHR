package com.sentinel.allergies.dto;

import jakarta.validation.constraints.NotBlank;

public class AllergyStatusUpdateDTO {

    @NotBlank(message = "Status is required")
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
