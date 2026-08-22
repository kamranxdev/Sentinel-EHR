package com.sentinel.identity.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class UserResponseDTO {
    private UUID id;
    private UUID personId;
    private String email;
    private String firstName;
    private String lastName;
    private String middleName;
    private String fullName;
    private String gender;
    private String phone;
    private String status;
    private Boolean mfaEnabled;
    private Set<String> roles;
    private List<UserOrgDTO> organizations;
    private OffsetDateTime lastLoginAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private String specialization;
    private String specialty;
    private String department;
    private String licenseNumber;
    private String qualifications;
    private String verificationStatus;

    public UserResponseDTO() {}

    public static class UserOrgDTO {
        private UUID id;
        private String name;
        private String code;
        private String employmentType;

        public UserOrgDTO() {}

        public UserOrgDTO(UUID id, String name, String code, String employmentType) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.employmentType = employmentType;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPersonId() { return personId; }
    public void setPersonId(UUID personId) { this.personId = personId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
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
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status; 
        if (this.verificationStatus == null) {
            this.verificationStatus = status;
        }
    }
    public String getVerificationStatus() { return verificationStatus != null ? verificationStatus : status; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public Boolean getMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(Boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public List<UserOrgDTO> getOrganizations() { return organizations; }
    public void setOrganizations(List<UserOrgDTO> organizations) { this.organizations = organizations; }
    public OffsetDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(OffsetDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { 
        this.specialization = specialization; 
        if (this.specialty == null) this.specialty = specialization;
    }
    public String getSpecialty() { return specialty != null ? specialty : specialization; }
    public void setSpecialty(String specialty) { 
        this.specialty = specialty; 
        if (this.specialization == null) this.specialization = specialty;
    }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
}
