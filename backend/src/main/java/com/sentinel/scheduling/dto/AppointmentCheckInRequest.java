package com.sentinel.scheduling.dto;

import java.math.BigDecimal;

public class AppointmentCheckInRequest {
    private String notes;

    public AppointmentCheckInRequest() {}

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
