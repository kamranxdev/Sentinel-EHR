package com.sentinel.users.dto;

import jakarta.validation.constraints.NotBlank;

public class UserStatusUpdateRequestDTO {

    @NotBlank(message = "Status is required")
    private String status;

    public UserStatusUpdateRequestDTO() {}

    public UserStatusUpdateRequestDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
