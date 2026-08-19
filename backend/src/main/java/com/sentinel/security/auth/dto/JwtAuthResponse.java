package com.sentinel.security.auth.dto;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String email;
    private String fullName;
    private Set<String> roles;
    private Set<String> permissions;
    private UUID id;
    private UUID userId;
    private UUID patientId;
    private List<OrganizationContextDTO> organizations;

    public static class OrganizationContextDTO {
        private UUID id;
        private String code;
        private String name;
        private String legalName;
        private String organizationType;
        private String employeeCode;
        private String employmentType;
        private List<FacilityContextDTO> facilities;

        public OrganizationContextDTO() {}

        public OrganizationContextDTO(UUID id, String code, String name, String legalName, String organizationType, String employeeCode, String employmentType, List<FacilityContextDTO> facilities) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.legalName = legalName;
            this.organizationType = organizationType;
            this.employeeCode = employeeCode;
            this.employmentType = employmentType;
            this.facilities = facilities;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getLegalName() { return legalName; }
        public void setLegalName(String legalName) { this.legalName = legalName; }
        public String getOrganizationType() { return organizationType; }
        public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }
        public String getEmployeeCode() { return employeeCode; }
        public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public List<FacilityContextDTO> getFacilities() { return facilities; }
        public void setFacilities(List<FacilityContextDTO> facilities) { this.facilities = facilities; }
    }

    public static class FacilityContextDTO {
        private UUID id;
        private String code;
        private String name;
        private String facilityType;
        private List<DepartmentContextDTO> departments;

        public FacilityContextDTO() {}

        public FacilityContextDTO(UUID id, String code, String name, String facilityType, List<DepartmentContextDTO> departments) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.facilityType = facilityType;
            this.departments = departments;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getFacilityType() { return facilityType; }
        public void setFacilityType(String facilityType) { this.facilityType = facilityType; }
        public List<DepartmentContextDTO> getDepartments() { return departments; }
        public void setDepartments(List<DepartmentContextDTO> departments) { this.departments = departments; }
    }

    public static class DepartmentContextDTO {
        private UUID id;
        private String code;
        private String name;
        private String departmentType;

        public DepartmentContextDTO() {}

        public DepartmentContextDTO(UUID id, String code, String name, String departmentType) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.departmentType = departmentType;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDepartmentType() { return departmentType; }
        public void setDepartmentType(String departmentType) { this.departmentType = departmentType; }
    }

    public JwtAuthResponse() {}

    public JwtAuthResponse(String accessToken, String email, String fullName, Set<String> roles, Set<String> permissions, UUID id) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
        this.permissions = permissions;
        this.id = id;
        this.userId = id;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; this.userId = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; this.id = userId; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public List<OrganizationContextDTO> getOrganizations() { return organizations; }
    public void setOrganizations(List<OrganizationContextDTO> organizations) { this.organizations = organizations; }
}
