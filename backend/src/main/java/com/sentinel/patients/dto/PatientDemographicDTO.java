package com.sentinel.patients.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ABDM & DISHA Minimum Necessary Demographic DTO.
 * Explicitly excludes all clinical collections (notes, vitals, diagnoses, prescriptions, labs).
 */
public class PatientDemographicDTO {
    private Long id;
    private String patientCode;
    private String abhaId;
    private String nationalId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    private String phone;
    private String email;
    private String address;
    private String pinCode;
    private EmergencyContactDTO emergencyContact;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    private String coveragePlan;
    private String department;
    private LocalDateTime createdAt;

    public PatientDemographicDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public String getAbhaId() { return abhaId; }
    public void setAbhaId(String abhaId) { this.abhaId = abhaId; }

    public String getNationalId() { return nationalId; }
    public void setNationalId(String nationalId) { this.nationalId = nationalId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }

    public EmergencyContactDTO getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(EmergencyContactDTO emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceGroupNumber() { return insuranceGroupNumber; }
    public void setInsuranceGroupNumber(String insuranceGroupNumber) { this.insuranceGroupNumber = insuranceGroupNumber; }

    public String getCoveragePlan() { return coveragePlan; }
    public void setCoveragePlan(String coveragePlan) { this.coveragePlan = coveragePlan; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
