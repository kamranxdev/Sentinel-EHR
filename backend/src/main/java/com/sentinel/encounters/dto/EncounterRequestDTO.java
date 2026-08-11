package com.sentinel.encounters.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EncounterRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long attendingProviderId;

    @NotBlank(message = "Encounter type is required")
    private String encounterType;

    private String chiefComplaint;
    private String clinicalNotes;
    private String dischargeSummary;
    private String status;
    private LocalDateTime encounterDate;

    // Admission fields
    private String admissionType;
    private String admissionSource;
    private String department;
    private String departmentName;
    private String acuityScore;
    private String admissionDiagnosisIcd;

    public EncounterRequestDTO() {}

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public void setPatient(java.util.Map<String, Object> patientMap) {
        if (patientMap != null && patientMap.containsKey("id")) {
            Object idObj = patientMap.get("id");
            if (idObj instanceof Number) {
                this.patientId = ((Number) idObj).longValue();
            }
        }
    }

    public Long getAttendingProviderId() {
        return attendingProviderId;
    }

    public void setAttendingProviderId(Long attendingProviderId) {
        this.attendingProviderId = attendingProviderId;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getDischargeSummary() {
        return dischargeSummary;
    }

    public void setDischargeSummary(String dischargeSummary) {
        this.dischargeSummary = dischargeSummary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getEncounterDate() {
        return encounterDate;
    }

    public void setEncounterDate(LocalDateTime encounterDate) {
        this.encounterDate = encounterDate;
    }

    public String getAdmissionType() {
        return admissionType;
    }

    public void setAdmissionType(String admissionType) {
        this.admissionType = admissionType;
    }

    public String getAdmissionSource() {
        return admissionSource;
    }

    public void setAdmissionSource(String admissionSource) {
        this.admissionSource = admissionSource;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
        if (this.departmentName == null) {
            this.departmentName = department;
        }
    }

    public String getDepartmentName() {
        return departmentName != null ? departmentName : department;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getAcuityScore() {
        return acuityScore;
    }

    public void setAcuityScore(String acuityScore) {
        this.acuityScore = acuityScore;
    }

    public String getAdmissionDiagnosisIcd() {
        return admissionDiagnosisIcd;
    }

    public void setAdmissionDiagnosisIcd(String admissionDiagnosisIcd) {
        this.admissionDiagnosisIcd = admissionDiagnosisIcd;
    }
}
