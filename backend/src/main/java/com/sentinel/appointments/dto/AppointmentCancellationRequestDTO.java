package com.sentinel.appointments.dto;

public class AppointmentCancellationRequestDTO {
    private String reason;
    private String comment;

    public AppointmentCancellationRequestDTO() {}

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
