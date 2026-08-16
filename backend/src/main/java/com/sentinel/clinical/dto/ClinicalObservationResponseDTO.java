package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ClinicalObservationResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private String observationCode;
    private String observationName;
    private String valueString;
    private String valueUnit;
    private String status;
    private String recordedByUsername;
    private OffsetDateTime observedAt;

    public ClinicalObservationResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getObservationCode() { return observationCode; }
    public void setObservationCode(String observationCode) { this.observationCode = observationCode; }
    public String getObservationName() { return observationName; }
    public void setObservationName(String observationName) { this.observationName = observationName; }
    public String getValueString() { return valueString; }
    public void setValueString(String valueString) { this.valueString = valueString; }
    public String getValueUnit() { return valueUnit; }
    public void setValueUnit(String valueUnit) { this.valueUnit = valueUnit; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRecordedByUsername() { return recordedByUsername; }
    public void setRecordedByUsername(String recordedByUsername) { this.recordedByUsername = recordedByUsername; }
    public OffsetDateTime getObservedAt() { return observedAt; }
    public void setObservedAt(OffsetDateTime observedAt) { this.observedAt = observedAt; }
}
