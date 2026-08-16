package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TransferResponseDTO {
    private UUID id;
    private UUID encounterId;
    private UUID fromDepartmentId;
    private UUID fromWardId;
    private UUID fromBedId;
    private UUID toDepartmentId;
    private UUID toWardId;
    private UUID toBedId;
    private String reason;
    private String transferredByUsername;
    private OffsetDateTime transferredAt;

    public TransferResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
    public UUID getFromDepartmentId() { return fromDepartmentId; }
    public void setFromDepartmentId(UUID fromDepartmentId) { this.fromDepartmentId = fromDepartmentId; }
    public UUID getFromWardId() { return fromWardId; }
    public void setFromWardId(UUID fromWardId) { this.fromWardId = fromWardId; }
    public UUID getFromBedId() { return fromBedId; }
    public void setFromBedId(UUID fromBedId) { this.fromBedId = fromBedId; }
    public UUID getToDepartmentId() { return toDepartmentId; }
    public void setToDepartmentId(UUID toDepartmentId) { this.toDepartmentId = toDepartmentId; }
    public UUID getToWardId() { return toWardId; }
    public void setToWardId(UUID toWardId) { this.toWardId = toWardId; }
    public UUID getToBedId() { return toBedId; }
    public void setToBedId(UUID toBedId) { this.toBedId = toBedId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getTransferredByUsername() { return transferredByUsername; }
    public void setTransferredByUsername(String transferredByUsername) { this.transferredByUsername = transferredByUsername; }
    public OffsetDateTime getTransferredAt() { return transferredAt; }
    public void setTransferredAt(OffsetDateTime transferredAt) { this.transferredAt = transferredAt; }
}
