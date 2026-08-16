package com.sentinel.scheduling.dto;

import jakarta.validation.constraints.NotBlank;

public class AppointmentCancelRequest {
    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;
    private String additionalComment;

    public AppointmentCancelRequest() {}

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public String getAdditionalComment() { return additionalComment; }
    public void setAdditionalComment(String additionalComment) { this.additionalComment = additionalComment; }
}
