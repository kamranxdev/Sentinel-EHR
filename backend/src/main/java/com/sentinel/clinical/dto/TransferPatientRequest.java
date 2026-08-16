package com.sentinel.clinical.dto;

import java.util.UUID;

public class TransferPatientRequest {
    private UUID toDepartmentId;
    private UUID toWardId;
    private UUID toBedId;
    private String reason;

    public TransferPatientRequest() {}

    public UUID getToDepartmentId() { return toDepartmentId; }
    public void setToDepartmentId(UUID toDepartmentId) { this.toDepartmentId = toDepartmentId; }
    public UUID getToWardId() { return toWardId; }
    public void setToWardId(UUID toWardId) { this.toWardId = toWardId; }
    public UUID getToBedId() { return toBedId; }
    public void setToBedId(UUID toBedId) { this.toBedId = toBedId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
