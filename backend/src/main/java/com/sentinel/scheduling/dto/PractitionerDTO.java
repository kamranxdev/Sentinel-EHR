package com.sentinel.scheduling.dto;

import java.util.UUID;

public class PractitionerDTO {
    private UUID id;
    private String identifier;
    private String firstName;
    private String lastName;
    private String primarySpecialty;
    private String status;

    public PractitionerDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPrimarySpecialty() { return primarySpecialty; }
    public void setPrimarySpecialty(String primarySpecialty) { this.primarySpecialty = primarySpecialty; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFullName() {
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }
}
