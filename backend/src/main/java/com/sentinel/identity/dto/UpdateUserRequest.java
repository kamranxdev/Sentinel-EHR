package com.sentinel.identity.dto;

import java.util.Set;

public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String middleName;
    private String gender;
    private String phone;
    private String email;
    private String status;
    private Boolean mfaEnabled;
    private Set<String> roleNames;

    private String fullName;
    private String specialization;
    private String specialty;
    private String department;
    private String licenseNumber;
    private String qualifications;
    private String verificationStatus;

    public UpdateUserRequest() {}

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
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status; 
        if (this.verificationStatus == null) this.verificationStatus = status;
    }
    public String getVerificationStatus() { return verificationStatus != null ? verificationStatus : status; }
    public void setVerificationStatus(String verificationStatus) { 
        this.verificationStatus = verificationStatus; 
        if (this.status == null) this.status = verificationStatus;
    }
    public Boolean getMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(Boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
    public Set<String> getRoleNames() { return roleNames; }
    public void setRoleNames(Set<String> roleNames) { this.roleNames = roleNames; }
    public void setRoles(Set<String> roles) { this.roleNames = roles; }

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
