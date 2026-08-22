package com.sentinel.clinical.dto;

import java.util.UUID;

public class CreateEncounterRequest {
    private UUID patientId;
    private UUID organizationId;
    private UUID departmentId;
    private UUID careEpisodeId;
    private UUID sourceEncounterId;
    private String relationshipType;
    private String encounterType = "OUTPATIENT"; // OUTPATIENT, EMERGENCY, INPATIENT, OBSERVATION
    private String chiefComplaint;
    private String reasonForVisit;
    private String admissionSource;
    private String admissionType;
    private String acuity;
    private String disposition;
    private UUID appointmentId;
    private UUID attendingPractitionerId;

    public CreateEncounterRequest() {}

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public UUID getCareEpisodeId() { return careEpisodeId; }
    public void setCareEpisodeId(UUID careEpisodeId) { this.careEpisodeId = careEpisodeId; }

    public UUID getSourceEncounterId() { return sourceEncounterId; }
    public void setSourceEncounterId(UUID sourceEncounterId) { this.sourceEncounterId = sourceEncounterId; }

    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }

    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }

    public String getAdmissionType() { return admissionType; }
    public void setAdmissionType(String admissionType) { this.admissionType = admissionType; }

    public String getAcuity() { return acuity; }
    public void setAcuity(String acuity) { this.acuity = acuity; }

    public String getDisposition() { return disposition; }
    public void setDisposition(String disposition) { this.disposition = disposition; }

    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }

    public UUID getAttendingPractitionerId() { return attendingPractitionerId; }
    public void setAttendingPractitionerId(UUID attendingPractitionerId) { this.attendingPractitionerId = attendingPractitionerId; }
}
