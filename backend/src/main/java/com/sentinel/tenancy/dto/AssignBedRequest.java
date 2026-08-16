package com.sentinel.tenancy.dto;

import java.util.UUID;

public class AssignBedRequest {
    private UUID encounterId;

    public AssignBedRequest() {}

    public AssignBedRequest(UUID encounterId) {
        this.encounterId = encounterId;
    }

    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }
}
