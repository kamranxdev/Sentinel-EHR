package com.sentinel.encounters.dto;

import jakarta.validation.constraints.NotBlank;

public class BedRequestDTO {

    @NotBlank(message = "Bed number is required")
    private String bedNumber;

    private String ward;
    private String department;
    private String roomNumber;
    private String bedType;

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }
}
