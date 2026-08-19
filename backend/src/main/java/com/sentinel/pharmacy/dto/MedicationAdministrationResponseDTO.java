package com.sentinel.pharmacy.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class MedicationAdministrationResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID prescriptionId;
    private String medicationName;
    private String dose;
    private String route;
    private String status;
    private String administeredByEmail;
    private OffsetDateTime administeredAt;

    public MedicationAdministrationResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(UUID prescriptionId) { this.prescriptionId = prescriptionId; }
    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public String getDose() { return dose; }
    public void setDose(String dose) { this.dose = dose; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdministeredByEmail() { return administeredByEmail; }
    public void setAdministeredByEmail(String administeredByEmail) { this.administeredByEmail = administeredByEmail; }
    public OffsetDateTime getAdministeredAt() { return administeredAt; }
    public void setAdministeredAt(OffsetDateTime administeredAt) { this.administeredAt = administeredAt; }
}
