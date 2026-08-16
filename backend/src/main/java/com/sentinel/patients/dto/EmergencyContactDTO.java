package com.sentinel.patients.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EmergencyContactDTO {

    private Long id;
    private String name;
    private String relationship;
    private String phone;
    private String email;
    private String address;

    public EmergencyContactDTO() {}

    public EmergencyContactDTO(String name, String relationship, String phone) {
        this.name = name;
        this.relationship = relationship;
        this.phone = phone;
    }

    public EmergencyContactDTO(Long id, String name, String relationship, String phone, String email, String address) {
        this.id = id;
        this.name = name;
        this.relationship = relationship;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
