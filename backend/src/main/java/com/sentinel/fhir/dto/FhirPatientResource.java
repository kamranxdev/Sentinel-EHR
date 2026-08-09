package com.sentinel.fhir.dto;

import java.util.List;
import java.util.Map;

public class FhirPatientResource {
    private String resourceType = "Patient";
    private String id;
    private Boolean active = true;
    private List<Map<String, Object>> identifier;
    private List<Map<String, Object>> name;
    private String gender;
    private String birthDate;
    private List<Map<String, Object>> telecom;
    private List<Map<String, Object>> address;
    private List<Map<String, Object>> extension;

    public FhirPatientResource() {}

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<Map<String, Object>> getIdentifier() {
        return identifier;
    }

    public void setIdentifier(List<Map<String, Object>> identifier) {
        this.identifier = identifier;
    }

    public List<Map<String, Object>> getName() {
        return name;
    }

    public void setName(List<Map<String, Object>> name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public List<Map<String, Object>> getTelecom() {
        return telecom;
    }

    public void setTelecom(List<Map<String, Object>> telecom) {
        this.telecom = telecom;
    }

    public List<Map<String, Object>> getAddress() {
        return address;
    }

    public void setAddress(List<Map<String, Object>> address) {
        this.address = address;
    }

    public List<Map<String, Object>> getExtension() {
        return extension;
    }

    public void setExtension(List<Map<String, Object>> extension) {
        this.extension = extension;
    }
}
