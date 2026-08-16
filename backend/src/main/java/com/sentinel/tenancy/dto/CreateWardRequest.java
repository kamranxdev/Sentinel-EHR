package com.sentinel.tenancy.dto;

public class CreateWardRequest {
    private String code;
    private String name;
    private String wardType;
    private Integer floorNumber;
    private String building;

    public CreateWardRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getWardType() { return wardType; }
    public void setWardType(String wardType) { this.wardType = wardType; }
    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
}
