package com.sentinel.pharmacy.dto;

import java.time.OffsetDateTime;

public class AdministerMedicationRequest {
    private String medicationName;
    private String dose;
    private String route;
    private String notes;
    private OffsetDateTime administeredAt;

    public AdministerMedicationRequest() {}

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public String getDose() { return dose; }
    public void setDose(String dose) { this.dose = dose; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public OffsetDateTime getAdministeredAt() { return administeredAt; }
    public void setAdministeredAt(OffsetDateTime administeredAt) { this.administeredAt = administeredAt; }
}
