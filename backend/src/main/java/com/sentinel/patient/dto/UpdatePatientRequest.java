package com.sentinel.patient.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class UpdatePatientRequest {
    private String firstName;
    private String lastName;
    private String middleName;
    private String gender;
    private LocalDate dateOfBirth;
    private String status;
    private OffsetDateTime deceasedAt;

    public UpdatePatientRequest() {}

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getDeceasedAt() { return deceasedAt; }
    public void setDeceasedAt(OffsetDateTime deceasedAt) { this.deceasedAt = deceasedAt; }
}
