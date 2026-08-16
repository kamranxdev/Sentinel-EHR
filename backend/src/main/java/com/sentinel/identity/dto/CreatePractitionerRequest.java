package com.sentinel.identity.dto;

import java.util.UUID;

public class CreatePractitionerRequest {
    private String firstName;
    private String lastName;
    private String middleName;
    private String gender;
    private String identifier;
    private String practitionerType;
    private String primarySpecialty;
    private UUID organizationId;

    public CreatePractitionerRequest() {}

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getPractitionerType() { return practitionerType; }
    public void setPractitionerType(String practitionerType) { this.practitionerType = practitionerType; }
    public String getPrimarySpecialty() { return primarySpecialty; }
    public void setPrimarySpecialty(String primarySpecialty) { this.primarySpecialty = primarySpecialty; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
}
