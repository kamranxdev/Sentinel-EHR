package com.sentinel.clinical.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class InpatientCareResponseDTO {
    private UUID encounterId;
    private String encounterNumber;
    private String encounterType;
    private String encounterStatus;

    private UUID admissionId;
    private OffsetDateTime admissionDate;
    private String admissionDiagnosis;
    private String admissionType;
    private String admissionSource;
    private Integer lengthOfStayDays;

    private UUID patientId;
    private String patientCode;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String bloodGroup;

    private UUID bedId;
    private String bedCode;
    private String bedNumber;
    private String bedType;
    private UUID wardId;
    private String wardName;
    private String roomNumber;
    private String departmentName;

    private UUID careTeamId;
    private String careTeamName;
    private String myRole;
    private Boolean isAttending;
    private Boolean isPrimaryNurse;
    private List<CareTeamMemberInfoDTO> careTeamMembers = new ArrayList<>();

    private Integer ewsScore;
    private String acuityLevel;
    private String codeStatus;
    private String fallRisk;
    private String isolation;

    public InpatientCareResponseDTO() {}

    public static class CareTeamMemberInfoDTO {
        private UUID id;
        private UUID practitionerId;
        private UUID userId;
        private String name;
        private String role;
        private String roleCategory;
        private String specialty;
        private String email;
        private OffsetDateTime startedAt;

        public CareTeamMemberInfoDTO() {}

        public CareTeamMemberInfoDTO(UUID id, UUID practitionerId, UUID userId, String name, String role, String roleCategory, String specialty, String email, OffsetDateTime startedAt) {
            this.id = id;
            this.practitionerId = practitionerId;
            this.userId = userId;
            this.name = name;
            this.role = role;
            this.roleCategory = roleCategory;
            this.specialty = specialty;
            this.email = email;
            this.startedAt = startedAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getPractitionerId() { return practitionerId; }
        public void setPractitionerId(UUID practitionerId) { this.practitionerId = practitionerId; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getRoleCategory() { return roleCategory; }
        public void setRoleCategory(String roleCategory) { this.roleCategory = roleCategory; }
        public String getSpecialty() { return specialty; }
        public void setSpecialty(String specialty) { this.specialty = specialty; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public OffsetDateTime getStartedAt() { return startedAt; }
        public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
    }

    public UUID getEncounterId() { return encounterId; }
    public void setEncounterId(UUID encounterId) { this.encounterId = encounterId; }

    public String getEncounterNumber() { return encounterNumber; }
    public void setEncounterNumber(String encounterNumber) { this.encounterNumber = encounterNumber; }

    public String getEncounterType() { return encounterType; }
    public void setEncounterType(String encounterType) { this.encounterType = encounterType; }

    public String getEncounterStatus() { return encounterStatus; }
    public void setEncounterStatus(String encounterStatus) { this.encounterStatus = encounterStatus; }

    public UUID getAdmissionId() { return admissionId; }
    public void setAdmissionId(UUID admissionId) { this.admissionId = admissionId; }

    public OffsetDateTime getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(OffsetDateTime admissionDate) { this.admissionDate = admissionDate; }

    public String getAdmissionDiagnosis() { return admissionDiagnosis; }
    public void setAdmissionDiagnosis(String admissionDiagnosis) { this.admissionDiagnosis = admissionDiagnosis; }

    public String getAdmissionType() { return admissionType; }
    public void setAdmissionType(String admissionType) { this.admissionType = admissionType; }

    public String getAdmissionSource() { return admissionSource; }
    public void setAdmissionSource(String admissionSource) { this.admissionSource = admissionSource; }

    public Integer getLengthOfStayDays() { return lengthOfStayDays; }
    public void setLengthOfStayDays(Integer lengthOfStayDays) { this.lengthOfStayDays = lengthOfStayDays; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public UUID getBedId() { return bedId; }
    public void setBedId(UUID bedId) { this.bedId = bedId; }

    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }

    public UUID getWardId() { return wardId; }
    public void setWardId(UUID wardId) { this.wardId = wardId; }

    public String getWardName() { return wardName; }
    public void setWardName(String wardName) { this.wardName = wardName; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public UUID getCareTeamId() { return careTeamId; }
    public void setCareTeamId(UUID careTeamId) { this.careTeamId = careTeamId; }

    public String getCareTeamName() { return careTeamName; }
    public void setCareTeamName(String careTeamName) { this.careTeamName = careTeamName; }

    public String getMyRole() { return myRole; }
    public void setMyRole(String myRole) { this.myRole = myRole; }

    public Boolean getIsAttending() { return isAttending; }
    public void setIsAttending(Boolean attending) { isAttending = attending; }

    public Boolean getIsPrimaryNurse() { return isPrimaryNurse; }
    public void setIsPrimaryNurse(Boolean primaryNurse) { isPrimaryNurse = primaryNurse; }

    public List<CareTeamMemberInfoDTO> getCareTeamMembers() { return careTeamMembers; }
    public void setCareTeamMembers(List<CareTeamMemberInfoDTO> careTeamMembers) { this.careTeamMembers = careTeamMembers; }

    public Integer getEwsScore() { return ewsScore; }
    public void setEwsScore(Integer ewsScore) { this.ewsScore = ewsScore; }

    public String getAcuityLevel() { return acuityLevel; }
    public void setAcuityLevel(String acuityLevel) { this.acuityLevel = acuityLevel; }

    public String getCodeStatus() { return codeStatus; }
    public void setCodeStatus(String codeStatus) { this.codeStatus = codeStatus; }

    public String getFallRisk() { return fallRisk; }
    public void setFallRisk(String fallRisk) { this.fallRisk = fallRisk; }

    public String getIsolation() { return isolation; }
    public void setIsolation(String isolation) { this.isolation = isolation; }
}
