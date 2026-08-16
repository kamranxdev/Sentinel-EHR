package com.sentinel.patient.dto;

import java.util.UUID;

public class MPIMergeRequestDTO {
    private UUID primaryPatientId;
    private UUID duplicatePatientId;
    private String mergeReason;

    public MPIMergeRequestDTO() {}

    public UUID getPrimaryPatientId() { return primaryPatientId; }
    public void setPrimaryPatientId(UUID primaryPatientId) { this.primaryPatientId = primaryPatientId; }

    public UUID getDuplicatePatientId() { return duplicatePatientId; }
    public void setDuplicatePatientId(UUID duplicatePatientId) { this.duplicatePatientId = duplicatePatientId; }

    public String getMergeReason() { return mergeReason; }
    public void setMergeReason(String mergeReason) { this.mergeReason = mergeReason; }
}
