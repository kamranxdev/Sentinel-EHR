package com.sentinel.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OrganizationStatusUpdateDTO {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "PENDING_VERIFICATION|VERIFIED|SUSPENDED", message = "Status must be PENDING_VERIFICATION, VERIFIED, or SUSPENDED")
    private String status;

    private String notes;

    public OrganizationStatusUpdateDTO() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
