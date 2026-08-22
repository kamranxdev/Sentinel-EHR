package com.sentinel.clinical.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class EmergencyDispositionRequest {

    @NotBlank(message = "Disposition is required (DISCHARGE, OBSERVE, ADMIT, TRANSFER, AMA)")
    private String disposition;

    private String notes;
    private String dischargeInstructions;
    private UUID admittingPractitionerId;
    private UUID admittingDepartmentId;
    private UUID wardId;
    private UUID roomId;
    private UUID bedId;
    private String admissionType;
    private String admissionReason;

    public EmergencyDispositionRequest() {}

    public String getDisposition() { return disposition; }
    public void setDisposition(String disposition) { this.disposition = disposition; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDischargeInstructions() { return dischargeInstructions; }
    public void setDischargeInstructions(String dischargeInstructions) { this.dischargeInstructions = dischargeInstructions; }

    public UUID getAdmittingPractitionerId() { return admittingPractitionerId; }
    public void setAdmittingPractitionerId(UUID admittingPractitionerId) { this.admittingPractitionerId = admittingPractitionerId; }

    public UUID getAdmittingDepartmentId() { return admittingDepartmentId; }
    public void setAdmittingDepartmentId(UUID admittingDepartmentId) { this.admittingDepartmentId = admittingDepartmentId; }

    public UUID getWardId() { return wardId; }
    public void setWardId(UUID wardId) { this.wardId = wardId; }

    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }

    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }

    public String getAdmissionType() { return admissionType; }
    public void setAdmissionType(String admissionType) { this.admissionType = admissionType; }

    public String getAdmissionReason() { return admissionReason; }
    public void setAdmissionReason(String admissionReason) { this.admissionReason = admissionReason; }
}
