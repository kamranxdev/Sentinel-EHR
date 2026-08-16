package com.sentinel.patient.dto;

import java.time.LocalDate;

public class AddSubstanceUseRequest {
    private String substanceName;
    private String status;
    private String route;
    private String frequency;
    private String quantity;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;

    public AddSubstanceUseRequest() {}

    public String getSubstanceName() { return substanceName; }
    public void setSubstanceName(String substanceName) { this.substanceName = substanceName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
