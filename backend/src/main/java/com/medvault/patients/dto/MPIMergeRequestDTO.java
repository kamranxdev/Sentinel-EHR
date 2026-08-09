package com.medvault.patients.dto;

public class MPIMergeRequestDTO {
    private Long primaryPatientId;
    private Long duplicatePatientId;
    private String mergeReason;

    public MPIMergeRequestDTO() {}

    public Long getPrimaryPatientId() { return primaryPatientId; }
    public void setPrimaryPatientId(Long primaryPatientId) { this.primaryPatientId = primaryPatientId; }

    public Long getDuplicatePatientId() { return duplicatePatientId; }
    public void setDuplicatePatientId(Long duplicatePatientId) { this.duplicatePatientId = duplicatePatientId; }

    public String getMergeReason() { return mergeReason; }
    public void setMergeReason(String mergeReason) { this.mergeReason = mergeReason; }
}
