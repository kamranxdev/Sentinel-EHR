package com.sentinel.clinical.dto;

import java.util.UUID;

public class UpdateEncounterRequest {
    private String encounterType;
    private String status;
    private UUID departmentId;
    private String chiefComplaint;
    private String reasonForVisit;
    private String acuity;
    private String disposition;

    public UpdateEncounterRequest() {}

    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }
    public String getAcuity() { return acuity; }
    public void setAcuity(String acuity) { this.acuity = acuity; }
    public String getDisposition() { return disposition; }
    public void setDisposition(String disposition) { this.disposition = disposition; }
}
