package com.sentinel.consent.dto;

public class RevokeConsentRequest {
    private String reason;

    public RevokeConsentRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
