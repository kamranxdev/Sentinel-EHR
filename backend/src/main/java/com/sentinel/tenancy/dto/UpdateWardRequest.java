package com.sentinel.tenancy.dto;

public class UpdateWardRequest {
    private String name;
    private String wardType;
    private Integer floorNumber;
    private String building;
    private String status;

    public UpdateWardRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getWardType() { return wardType; }
    public void setWardType(String wardType) { this.wardType = wardType; }
    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
