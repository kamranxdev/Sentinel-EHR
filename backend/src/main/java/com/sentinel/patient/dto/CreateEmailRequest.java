package com.sentinel.patient.dto;

public class CreateEmailRequest {
    private String emailType;
    private String email;
    private Boolean isPrimary;

    public CreateEmailRequest() {}

    public String getEmailType() { return emailType; }
    public void setEmailType(String emailType) { this.emailType = emailType; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
}
