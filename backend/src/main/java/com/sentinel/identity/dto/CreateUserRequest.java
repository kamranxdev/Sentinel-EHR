package com.sentinel.identity.dto;

import java.util.Set;
import java.util.UUID;

public class CreateUserRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String middleName;
    private String gender;
    private String phone;
    private Set<String> roleNames;
    private UUID organizationId;

    private String fullName;
    private String specialization;
    private String specialty;
    private String department;
    private String licenseNumber;
    private String qualifications;
    private Integer yearsOfExperience;
    private String medicalBoardState;

    public CreateUserRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
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
    public Set<String> getRoleNames() { return roleNames; }
    public void setRoleNames(Set<String> roleNames) { this.roleNames = roleNames; }
    public void setRoles(Set<String> roles) { this.roleNames = roles; }
    public void setRole(String role) { 
        if (role != null) {
            this.roleNames = Set.of(role);
        }
    }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
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
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getMedicalBoardState() { return medicalBoardState; }
    public void setMedicalBoardState(String medicalBoardState) { this.medicalBoardState = medicalBoardState; }
}
