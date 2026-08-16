package com.sentinel.clinical.dto;

public class CreateCareTeamRequest {
    private String name;

    public CreateCareTeamRequest() {}

    public CreateCareTeamRequest(String name) {
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
