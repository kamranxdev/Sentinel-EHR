package com.sentinel.organization.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrganizationRegistrationDTO {

    @NotBlank(message = "Facility / Organization name is required")
    @Size(min = 3, max = 255)
    private String orgName;

    @NotBlank(message = "License registration number is required")
    private String licenseNumber;

    @Email(message = "Valid facility contact email is required")
    private String email;

    private String phone;
    private String address;

    // Primary Org Admin Account Payload
    @NotBlank(message = "Admin username is required")
    @Size(min = 3, max = 50)
    private String adminUsername;

    @NotBlank(message = "Admin password is required")
    @Size(min = 6, max = 100)
    private String adminPassword;

    @Email(message = "Valid admin email is required")
    @NotBlank(message = "Admin email is required")
    private String adminEmail;

    @NotBlank(message = "Admin full name is required")
    private String adminFullName;

    public OrganizationRegistrationDTO() {}

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAdminFullName() {
        return adminFullName;
    }

    public void setAdminFullName(String adminFullName) {
        this.adminFullName = adminFullName;
    }
}
