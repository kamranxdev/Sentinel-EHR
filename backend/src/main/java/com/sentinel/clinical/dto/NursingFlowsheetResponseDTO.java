package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class NursingFlowsheetResponseDTO {
    private UUID id;
    private UUID patientId;
    private UUID encounterId;
    private String flowsheetType;
    private String status;
    private String recordedByEmail;
    private List<EntryDTO> entries;
    private OffsetDateTime recordedAt;

    public NursingFlowsheetResponseDTO() {}

    public static class EntryDTO {
        private UUID id;
        private String itemKey;
        private String itemValue;

        public EntryDTO() {}

        public EntryDTO(UUID id, String itemKey, String itemValue) {
            this.id = id;
            this.itemKey = itemKey;
            this.itemValue = itemValue;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getItemKey() { return itemKey; }
        public void setItemKey(String itemKey) { this.itemKey = itemKey; }
        public String getItemValue() { return itemValue; }
        public void setItemValue(String itemValue) { this.itemValue = itemValue; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public String getFlowsheetType() { return flowsheetType; }
    public void setFlowsheetType(String flowsheetType) { this.flowsheetType = flowsheetType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRecordedByEmail() { return recordedByEmail; }
    public void setRecordedByEmail(String recordedByEmail) { this.recordedByEmail = recordedByEmail; }
    public List<EntryDTO> getEntries() { return entries; }
    public void setEntries(List<EntryDTO> entries) { this.entries = entries; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
}
