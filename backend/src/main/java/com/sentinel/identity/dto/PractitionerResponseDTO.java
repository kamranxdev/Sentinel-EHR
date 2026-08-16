package com.sentinel.identity.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class PractitionerResponseDTO {
    private UUID id;
    private UUID personId;
    private String identifier;
    private String firstName;
    private String lastName;
    private String middleName;
    private String fullName;
    private String gender;
    private String practitionerType;
    private String primarySpecialty;
    private String status;
    private List<SpecialtyDTO> specialties;
    private List<LicenseDTO> licenses;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public PractitionerResponseDTO() {}

    public static class SpecialtyDTO {
        private UUID id;
        private String specialtyCode;
        private String specialtyName;
        private Boolean isPrimary;

        public SpecialtyDTO() {}

        public SpecialtyDTO(UUID id, String specialtyCode, String specialtyName, Boolean isPrimary) {
            this.id = id;
            this.specialtyCode = specialtyCode;
            this.specialtyName = specialtyName;
            this.isPrimary = isPrimary;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getSpecialtyCode() { return specialtyCode; }
        public void setSpecialtyCode(String specialtyCode) { this.specialtyCode = specialtyCode; }
        public String getSpecialtyName() { return specialtyName; }
        public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
        public Boolean getIsPrimary() { return isPrimary; }
        public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    }

    public static class LicenseDTO {
        private UUID id;
        private String licenseNumber;
        private String issuingAuthority;
        private String state;
        private LocalDate validFrom;
        private LocalDate validTo;

        public LicenseDTO() {}

        public LicenseDTO(UUID id, String licenseNumber, String issuingAuthority, String state, LocalDate validFrom, LocalDate validTo) {
            this.id = id;
            this.licenseNumber = licenseNumber;
            this.issuingAuthority = issuingAuthority;
            this.state = state;
            this.validFrom = validFrom;
            this.validTo = validTo;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getLicenseNumber() { return licenseNumber; }
        public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
        public String getIssuingAuthority() { return issuingAuthority; }
        public void setIssuingAuthority(String issuingAuthority) { this.issuingAuthority = issuingAuthority; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public LocalDate getValidFrom() { return validFrom; }
        public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
        public LocalDate getValidTo() { return validTo; }
        public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPersonId() { return personId; }
    public void setPersonId(UUID personId) { this.personId = personId; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getPractitionerType() { return practitionerType; }
    public void setPractitionerType(String practitionerType) { this.practitionerType = practitionerType; }
    public String getPrimarySpecialty() { return primarySpecialty; }
    public void setPrimarySpecialty(String primarySpecialty) { this.primarySpecialty = primarySpecialty; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<SpecialtyDTO> getSpecialties() { return specialties; }
    public void setSpecialties(List<SpecialtyDTO> specialties) { this.specialties = specialties; }
    public List<LicenseDTO> getLicenses() { return licenses; }
    public void setLicenses(List<LicenseDTO> licenses) { this.licenses = licenses; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
