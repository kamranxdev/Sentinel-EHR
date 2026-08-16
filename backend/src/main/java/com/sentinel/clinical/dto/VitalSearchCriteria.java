package com.sentinel.clinical.dto;

import java.util.UUID;

public class VitalSearchCriteria {
    private UUID patientId;
    private UUID encounterId;

    public VitalSearchCriteria() {}

    public VitalSearchCriteria(UUID patientId, UUID encounterId) {
        this.patientId = patientId;
        this.encounterId = encounterId;
    }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
}
