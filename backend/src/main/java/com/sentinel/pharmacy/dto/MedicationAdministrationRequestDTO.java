package com.sentinel.pharmacy.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicationAdministrationRequestDTO {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private UUID prescriptionId;

    @NotBlank(message = "Medication name is required")
    private String medicationName;

    private String dose;
    private String route;
    private String status;

    public MedicationAdministrationRequestDTO() {}

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
}
