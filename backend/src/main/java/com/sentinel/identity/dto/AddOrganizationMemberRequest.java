package com.sentinel.identity.dto;

import java.time.LocalDate;

public class AddOrganizationMemberRequest {
    private String employeeCode;
    private String employmentType;
    private LocalDate joinedAt;

    public AddOrganizationMemberRequest() {}

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public LocalDate getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDate joinedAt) { this.joinedAt = joinedAt; }
}
