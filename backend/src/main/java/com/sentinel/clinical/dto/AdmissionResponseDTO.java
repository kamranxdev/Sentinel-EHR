package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AdmissionResponseDTO {
    private UUID id;
    private UUID encounterId;
    private UUID patientId;
    private String admissionSource;
    private String admitReason;
    private UUID bedId;
    private String bedNumber;
    private OffsetDateTime admittedAt;
    private OffsetDateTime dischargedAt;
    private String dischargeDisposition;
    private Integer lengthOfStayDays;

    public AdmissionResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }

    public String getAdmitReason() { return admitReason; }
    public void setAdmitReason(String admitReason) { this.admitReason = admitReason; }

    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public OffsetDateTime getAdmittedAt() { return admittedAt; }
    public void setAdmittedAt(OffsetDateTime admittedAt) { this.admittedAt = admittedAt; }

    public OffsetDateTime getDischargedAt() { return dischargedAt; }
    public void setDischargedAt(OffsetDateTime dischargedAt) { this.dischargedAt = dischargedAt; }

    public String getDischargeDisposition() { return dischargeDisposition; }
    public void setDischargeDisposition(String dischargeDisposition) { this.dischargeDisposition = dischargeDisposition; }

    public Integer getLengthOfStayDays() { return lengthOfStayDays; }
    public void setLengthOfStayDays(Integer lengthOfStayDays) { this.lengthOfStayDays = lengthOfStayDays; }
}
