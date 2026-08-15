package com.sentinel.users.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String fullName;

    private String specialization; // For Doctors
    private String department;     // String department name (e.g. "Cardiovascular Medicine")

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department departmentEntity; // Optional relation to Department entity

    private String licenseNumber;     // Medical Practice License / NPI Number
    private String qualifications;    // e.g., MD, MBBS, FACC, Board Certified
    private Integer yearsOfExperience; // Years of clinical practice
    private String medicalBoardState; // Licensing board jurisdiction
    private String verificationStatus = "VERIFIED"; // VERIFIED, PENDING_VERIFICATION

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String password, String email, String fullName) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Department getDepartmentEntity() {
        return departmentEntity;
    }

    public void setDepartmentEntity(Department departmentEntity) {
        this.departmentEntity = departmentEntity;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getQualifications() {
        return qualifications;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getMedicalBoardState() {
        return medicalBoardState;
    }

    public void setMedicalBoardState(String medicalBoardState) {
        this.medicalBoardState = medicalBoardState;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public org.hl7.fhir.r4.model.Practitioner toFhirPractitioner() {
        org.hl7.fhir.r4.model.Practitioner p = new org.hl7.fhir.r4.model.Practitioner();
        if (id != null) {
            p.setId("Practitioner/" + id);
        }

        if (licenseNumber != null && !licenseNumber.isBlank()) {
            p.addIdentifier()
                    .setSystem("urn:sentinel:license")
                    .setValue(licenseNumber);
        }

        if (fullName != null) {
            p.addName().setText(fullName);
        }

        if (email != null && !email.isBlank()) {
            p.addTelecom()
                    .setSystem(org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem.EMAIL)
                    .setValue(email);
        }

        if (qualifications != null && !qualifications.isBlank()) {
            org.hl7.fhir.r4.model.Practitioner.PractitionerQualificationComponent q = p.addQualification();
            q.getCode().setText(qualifications);
        }

        return p;
    }

    public org.hl7.fhir.r4.model.PractitionerRole toFhirPractitionerRole() {
        org.hl7.fhir.r4.model.PractitionerRole pr = new org.hl7.fhir.r4.model.PractitionerRole();
        if (id != null) {
            pr.setId("PractitionerRole/" + id);
            pr.setPractitioner(new org.hl7.fhir.r4.model.Reference("Practitioner/" + id));
        }

        if (specialization != null && !specialization.isBlank()) {
            org.hl7.fhir.r4.model.CodeableConcept spec = new org.hl7.fhir.r4.model.CodeableConcept();
            spec.setText(specialization);
            pr.addSpecialty(spec);
        }

        if (roles != null && !roles.isEmpty()) {
            for (Role role : roles) {
                org.hl7.fhir.r4.model.CodeableConcept roleCode = new org.hl7.fhir.r4.model.CodeableConcept();
                roleCode.setText(role.getName());
                pr.addCode(roleCode);
            }
        }

        return pr;
    }
}

